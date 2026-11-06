import { z } from "zod";

/** Raw GitHub GraphQL response shapes, validated before normalisation. */

const nullableString = z.string().nullable();

export const viewerIdResponseSchema = z.object({
  data: z.object({ user: z.object({ id: z.string() }).nullable() }),
});

export const userNodeSchema = z.object({
  login: z.string(),
  name: nullableString,
  avatarUrl: z.url(),
  url: z.url(),
  location: nullableString,
  company: nullableString,
  bio: nullableString,
  createdAt: z.string(),
  followers: z.object({ totalCount: z.number() }),
  repositories: z.object({ totalCount: z.number() }),
  socialAccounts: z.object({ nodes: z.array(z.object({ provider: z.string(), url: z.url() })) }),
  contributionsCollection: z.object({
    totalCommitContributions: z.number(),
    totalPullRequestContributions: z.number(),
    totalIssueContributions: z.number(),
    totalPullRequestReviewContributions: z.number(),
    contributionCalendar: z.object({
      totalContributions: z.number(),
      weeks: z.array(
        z.object({
          contributionDays: z.array(z.object({ date: z.string(), contributionCount: z.number() })),
        }),
      ),
    }),
  }),
});

const blobSchema = z.object({ text: nullableString }).nullable();

export const repoNodeSchema = z.object({
  nameWithOwner: z.string(),
  url: z.url(),
  homepageUrl: nullableString,
  description: nullableString,
  createdAt: z.string(),
  pushedAt: nullableString,
  stargazerCount: z.number(),
  languages: z.object({
    edges: z.array(
      z.object({ size: z.number(), node: z.object({ name: z.string(), color: nullableString }) }),
    ),
  }),
  defaultBranchRef: z
    .object({
      target: z.object({ history: z.object({ totalCount: z.number() }).optional() }).nullable(),
    })
    .nullable(),
  manifest0: blobSchema.optional(),
  manifest1: blobSchema.optional(),
  manifest2: blobSchema.optional(),
});

export const searchCountSchema = z.object({ issueCount: z.number() });

/** REST `GET /users/{login}` — the public email is readable here without extra token scopes. */
export const restUserSchema = z.object({ email: nullableString.optional() });

export const graphqlErrorSchema = z.object({
  errors: z.array(z.object({ message: z.string() })).optional(),
});

export type UserNode = z.infer<typeof userNodeSchema>;
export type RepoNode = z.infer<typeof repoNodeSchema>;
