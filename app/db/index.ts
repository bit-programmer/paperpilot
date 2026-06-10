import { drizzle } from 'drizzle-orm/node-postgres';
import env from "@/app/utils/env";
import { Pool } from "pg";
import * as schema from "./schema"

const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: (env.DB_MIGRATING || env.DB_SEEDING) ? 1 : undefined
});

const db = drizzle({ client: pool, schema });

export type db = typeof db;

export default db;