import "server-only";

import { z } from "zod";

/**
 * Server-only environment, validated once at module load.
 * GITHUB_TOKEN is optional: without it the site renders from the committed snapshot.
 * It must never be prefixed with NEXT_PUBLIC_.
 */
const serverEnvSchema = z.object({
  GITHUB_TOKEN: z
    .string()
    .trim()
    .min(1)
    .optional()
    .or(z.literal("").transform(() => undefined)),
  GITHUB_USERNAME: z.string().trim().min(1).default("uyenne06"),
});

export const serverEnv = serverEnvSchema.parse({
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  GITHUB_USERNAME: process.env.GITHUB_USERNAME,
});
