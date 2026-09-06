import { readFile } from "node:fs/promises";
import { Client } from "pg";

const seedFiles = [
  "prisma/seed-dzaoudzi-labattoir.sql",
  "prisma/seed-dt-users.sql",
];

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL absente.");
  }

  const client = new Client({ connectionString });
  await client.connect();

  try {
    for (const seedFile of seedFiles) {
      const sql = await readFile(seedFile, "utf8");
      await client.query(sql);
      console.log(`Seed applique : ${seedFile}`);
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
