import { defineConfig } from "drizzle-kit";
import env from '@/app/utils/env.server';

export default defineConfig({
  schema: "./app/core/db/schema/index.ts",
  out: "./app/core/db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL,
  },
  verbose: true,
  strict: true,
});