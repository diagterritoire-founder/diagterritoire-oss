import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { createServer, type Server } from "node:http";
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  utimesSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { once } from "node:events";
import test from "node:test";

const PROBE = "scripts/monitor-public-availability.sh";
const BACKUP_CHECK = "scripts/check-backup-health.sh";

type ScriptResult = { exitCode: number | null; stdout: string; stderr: string };

function runScript(
  path: string,
  env: Record<string, string>,
): Promise<ScriptResult> {
  return new Promise((resolve, reject) => {
    const child = spawn("bash", [path], {
      cwd: process.cwd(),
      env: { ...process.env, ...env },
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk: string) => { stdout += chunk; });
    child.stderr.on("data", (chunk: string) => { stderr += chunk; });
    child.on("error", reject);
    child.on("close", (exitCode) => resolve({ exitCode, stdout, stderr }));
  });
}

async function localServer(
  handler: (status: number) => number,
): Promise<{ url: string; count: () => number; close: () => Promise<void> }> {
  let calls = 0;
  const server: Server = createServer((req, res) => {
    calls++;
    const code = req.url === "/connexion" ? handler(calls) : 404;
    res.writeHead(code, { "Content-Type": "text/plain" });
    res.end("monitor test");
  });
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  const address = server.address();
  assert.ok(address && typeof address !== "string");
  return {
    url: "http://127.0.0.1:" + address.port + "/connexion",
    count: () => calls,
    close: async () => {
      server.close();
      await once(server, "close");
    },
  };
}

const probeEnv = {
  DT_MONITOR_ATTEMPTS: "2",
  DT_MONITOR_RETRY_SECONDS: "0",
  DT_MONITOR_CONNECT_TIMEOUT: "2",
  DT_MONITOR_MAX_TIME: "3",
};

test("sonde externe : 200 immédiat ou au second essai", async () => {
  for (const codes of [[200], [503, 200]]) {
    const server = await localServer((attempt) => codes[attempt - 1] ?? 200);
    try {
      const result = await runScript(PROBE, {
        ...probeEnv,
        DT_MONITOR_URL: server.url,
      });
      assert.equal(result.exitCode, 0, result.stderr);
      assert.match(result.stdout, /AVAILABILITY-OK/);
      assert.equal(server.count(), codes.length);
    } finally {
      await server.close();
    }
  }
});

test("sonde externe : 5xx et redirection restent des échecs", async () => {
  for (const code of [503, 302]) {
    const server = await localServer(() => code);
    try {
      const result = await runScript(PROBE, {
        ...probeEnv,
        DT_MONITOR_URL: server.url,
      });
      assert.equal(result.exitCode, 1);
      assert.match(result.stderr, /AVAILABILITY-FAIL/);
      assert.equal(server.count(), 2);
    } finally {
      await server.close();
    }
  }
});

test("sonde externe : refuse HTTP distant et paramètres invalides", async () => {
  const badUrl = await runScript(PROBE, {
    ...probeEnv,
    DT_MONITOR_URL: "http://example.org/connexion",
  });
  assert.equal(badUrl.exitCode, 2);

  const badAttempts = await runScript(PROBE, {
    ...probeEnv,
    DT_MONITOR_ATTEMPTS: "0",
  });
  assert.equal(badAttempts.exitCode, 2);
});

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "dt-backup-health-"));
  const backupDir = join(root, "backups");
  const binDir = join(root, "bin");
  mkdirSync(backupDir);
  mkdirSync(binDir);
  const dumpName = "diagterritoire-20261026T000000Z.dump";
  const dump = join(backupDir, dumpName);
  const payload = "fake archive, pg_restore is simulated by a local executable";
  writeFileSync(dump, payload);
  const checksum = createHash("sha256").update(payload).digest("hex");
  writeFileSync(dump + ".sha256", checksum + "  " + dumpName + "\n");

  const pgRestore = join(binDir, "pg_restore");
  writeFileSync(pgRestore, "#!/bin/sh\n[ \"$1\" = \"--list\" ] && [ -s \"$2\" ]\n");
  chmodSync(pgRestore, 0o755);

  const systemctl = join(binDir, "systemctl");
  writeFileSync(
    systemctl,
    "#!/bin/sh\nif [ \"$1\" = \"is-active\" ]; then [ \"$DT_TEST_TIMER_ACTIVE\" = \"1\" ]; exit $?; fi\nif [ \"$1\" = \"show\" ]; then echo \"${DT_TEST_BACKUP_RESULT:-success}\"; exit 0; fi\nexit 2\n",
  );
  chmodSync(systemctl, 0o755);
  return {
    dump,
    cleanup: () => rmSync(root, { recursive: true, force: true }),
    env: {
      DT_MONITOR_BACKUP_DIR: backupDir,
      DT_MONITOR_MAX_AGE_HOURS: "36",
      DT_MONITOR_SYSTEMD_CHECKS: "0",
      PATH: binDir + ":" + process.env.PATH,
    },
  };
}

test("sauvegarde locale : accepte archive récente + checksum + pg_restore", async () => {
  const fx = fixture();
  try {
    const result = await runScript(BACKUP_CHECK, fx.env);
    assert.equal(result.exitCode, 0, result.stderr);
    assert.match(result.stdout, /BACKUP-HEALTH-OK/);
  } finally { fx.cleanup(); }
});

test("sauvegarde locale : rejette checksum absent ou invalide et archive ancienne", async () => {
  const fx = fixture();
  try {
    const initial = await runScript(BACKUP_CHECK, fx.env);
    assert.equal(initial.exitCode, 0);

    writeFileSync(fx.dump + ".sha256", "0".repeat(64) + "  " + fx.dump.split("/").pop() + "\n");
    const corrupted = await runScript(BACKUP_CHECK, fx.env);
    assert.equal(corrupted.exitCode, 1);
    assert.match(corrupted.stderr, /checksum verification failed/);

    rmSync(fx.dump + ".sha256");
    const missing = await runScript(BACKUP_CHECK, fx.env);
    assert.equal(missing.exitCode, 1);
    assert.match(missing.stderr, /checksum file missing/);

    const oldDate = new Date(Date.now() - 48 * 3600 * 1000);
    utimesSync(fx.dump, oldDate, oldDate);
    const stale = await runScript(BACKUP_CHECK, fx.env);
    assert.equal(stale.exitCode, 1);
    assert.match(stale.stderr, /older than 36 hours/);
  } finally { fx.cleanup(); }
});

test("sauvegarde locale : détecte timer inactif et dernier service en échec", async () => {
  const fx = fixture();
  try {
    const disabled = await runScript(BACKUP_CHECK, {
      ...fx.env,
      DT_MONITOR_SYSTEMD_CHECKS: "1",
      DT_TEST_TIMER_ACTIVE: "0",
    });
    assert.equal(disabled.exitCode, 1);
    assert.match(disabled.stderr, /timer is not active/);

    const failed = await runScript(BACKUP_CHECK, {
      ...fx.env,
      DT_MONITOR_SYSTEMD_CHECKS: "1",
      DT_TEST_TIMER_ACTIVE: "1",
      DT_TEST_BACKUP_RESULT: "exit-code",
    });
    assert.equal(failed.exitCode, 1);
    assert.match(failed.stderr, /service result is not success/);

    const success = await runScript(BACKUP_CHECK, {
      ...fx.env,
      DT_MONITOR_SYSTEMD_CHECKS: "1",
      DT_TEST_TIMER_ACTIVE: "1",
      DT_TEST_BACKUP_RESULT: "success",
    });
    assert.equal(success.exitCode, 0, success.stderr);
  } finally { fx.cleanup(); }
});
