import { z } from "zod";

const ClientEnvSchema = z.object({
  NEXT_PUBLIC_LOG_LEVEL: z.string().default("debug"),
  NEXT_PUBLIC_BETTER_AUTH_URL: z.string(),
  NEXT_PUBLIC_APP_NAME: z.string(),
});

export default ClientEnvSchema.parse({
  NEXT_PUBLIC_LOG_LEVEL: process.env.NEXT_PUBLIC_LOG_LEVEL,
  NEXT_PUBLIC_BETTER_AUTH_URL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
});