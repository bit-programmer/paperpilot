import { defineConfig } from "drizzle-kit";
import env from '@/app/utils/env.server';

export default defineConfig({
  schema: "./app/db/schema/empty-schema.ts",
  out: "./app/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});