import { readFile } from "node:fs/promises";
import { hash } from "bcryptjs";
import { Client } from "pg";

const PASSWORD_SALT_ROUNDS = 12;

const seedFiles = [
  "prisma/seed-dzaoudzi-labattoir.sql",
  "prisma/seed-dt-users.sql",
];

const pilotCredentials = [
  {
    userId: "user-pilot-finances-contributor",
    envName: "DT_PILOT_CONTRIBUTOR_PASSWORD",
  },
  {
    userId: "user-pilot-finances-validator",
    envName: "DT_PILOT_VALIDATOR_PASSWORD",
  },
] as const;

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL absente.");
  }

  const credentials = pilotCredentials.map(
    ({ userId, envName }) => {
      const password = process.env[envName];

      if (!password) {
        throw new Error(`${envName} absente.`);
      }

      return {
        userId,
        password,
      };
    },
  );

  const client = new Client({ connectionString });
  await client.connect();

  try {
    for (const seedFile of seedFiles) {
      const sql = await readFile(seedFile, "utf8");
      await client.query(sql);
      console.log(`Seed applique : ${seedFile}`);
    }

    for (const credential of credentials) {
      const passwordHash = await hash(
        credential.password,
        PASSWORD_SALT_ROUNDS,
      );

      await client.query(
        `
          INSERT INTO "WorkspaceCredential" (
            "id",
            "userId",
            "passwordHash",
            "createdAt",
            "updatedAt"
          )
          VALUES ($1, $2, $3, NOW(), NOW())
          ON CONFLICT ("userId") DO UPDATE SET
            "passwordHash" = EXCLUDED."passwordHash",
            "updatedAt" = NOW()
        `,
        [
          `credential-${credential.userId}`,
          credential.userId,
          passwordHash,
        ],
      );

      console.log(
        `Credential pilote applique : ${credential.userId}`,
      );
    }
  } finally {
    await client.end();
  }

  console.log("Seed pilote : OK");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
