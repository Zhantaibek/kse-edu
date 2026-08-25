/**
 * Ensures database `education_crm` exists on shared kse-postgres (:5433).
 * Safe to run repeatedly (idempotent).
 */
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const kseCompose = path.resolve(__dirname, "../../kse-kg/docker-compose.yml");
const container = process.env.KSE_PG_CONTAINER || "kse-postgres";
const user = process.env.KSE_PG_USER || "kse";

function run(cmd) {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

try {
  run(`docker compose -f "${kseCompose}" up -d postgres`);
} catch {
  try {
    run(`docker start ${container}`);
  } catch {
    /* ignore */
  }
}

try {
  const exists = run(
    `docker exec ${container} psql -U ${user} -d postgres -Atc "SELECT 1 FROM pg_database WHERE datname = 'education_crm'"`,
  );
  if (exists !== "1") {
    run(`docker exec ${container} psql -U ${user} -d postgres -c "CREATE DATABASE education_crm OWNER ${user}"`);
    console.log("Created database education_crm");
  } else {
    console.log("Database education_crm already exists");
  }
  console.log(`OK: education_crm on ${container}:5433 (shared with KSE)`);
} catch (error) {
  console.error(
    `Failed to ensure education_crm. Is Docker running and container "${container}" up?\n` +
      `Try from kse-kg: npm run db:up`,
  );
  process.exit(1);
}
