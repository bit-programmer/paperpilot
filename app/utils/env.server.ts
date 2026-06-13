import { config } from 'dotenv';
import { expand } from 'dotenv-expand';
import { ZodError, z } from "zod";

expand(config());

const stringBoolean = z.coerce.string().transform((val) => {
  return val === "true";
}).default(false);

const EnvSchema = z.object({
  NODE_ENV: z.string().default("development"),
  LOG_LEVEL: z.string().default("debug"),
  BETTER_AUTH_SECRET: z.string(),
  DB_HOST: z.string(),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  DB_PORT: z.coerce.number(),
  DATABASE_URL: z.string(),
  DB_MIGRATING: stringBoolean,
  DB_SEEDING: stringBoolean,
  MAIL_HOST: z.string(),
  MAIL_PORT: z.coerce.number(),
  MAIL_USERNAME: z.string(),
  MAIL_PASSWORD: z.string(),
  MAIL_ID: z.string(),
  APP_NAME: z.string()
});

export type EnvSchema = z.infer<typeof EnvSchema>;

try {
  EnvSchema.parse(process.env);
} catch (error) {
  if (error instanceof ZodError) {
    let message = "Missing required values in .env:\n";
    error.issues.forEach((issue) => { message += issue.path + "\n"; });
    const e = new Error(message);
    e.stack = "";
    throw e;
  } else {
    console.error(error);
  }
}

export default EnvSchema.parse(process.env);