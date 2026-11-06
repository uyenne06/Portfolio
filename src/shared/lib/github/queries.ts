/**
 * GraphQL documents. Repository and search fields are generated per project with
 * aliases so the whole portfolio is fetched in a single round trip.
 */

export const USER_ID_QUERY = /* GraphQL */ `
  query UserId($login: String!) {
    user(login: $login) {
      id
    }
  }
`;

const USER_FIELDS = /* GraphQL */ `
  login
  name
  avatarUrl
  url
  location
  company
  bio
  createdAt
  followers { totalCount }
  repositories(privacy: PUBLIC, ownerAffiliations: OWNER) { totalCount }
  socialAccounts(first: 10) { nodes { provider url } }
  contributionsCollection {
    totalCommitContributions
    totalPullRequestContributions
    totalIssueContributions
    totalPullRequestReviewContributions
    contributionCalendar {
      totalContributions
      weeks { contributionDays { date contributionCount } }
    }
  }
`;

export type RepoQueryInput = {
  alias: string;
  owner: string;
  name: string;
  manifests: string[];
};

/** GraphQL string literal escaping for values we interpolate (repo names, paths). */
function literal(value: string): string {
  return JSON.stringify(value);
}

function repoBlock({ alias, owner, name, manifests }: RepoQueryInput): string {
  const manifestFields = manifests
    .slice(0, 3)
    .map(
      (path, index) =>
        `manifest${index}: object(expression: ${literal(`HEAD:${path}`)}) { ... on Blob { text } }`,
    )
    .join("\n");

  return /* GraphQL */ `
    ${alias}: repository(owner: ${literal(owner)}, name: ${literal(name)}) {
      nameWithOwner
      url
      homepageUrl
      description
      createdAt
      pushedAt
      stargazerCount
      languages(first: 12, orderBy: { field: SIZE, direction: DESC }) {
        edges { size node { name color } }
      }
      defaultBranchRef {
        target { ... on Commit { history(author: { id: $userId }) { totalCount } } }
      }
      ${manifestFields}
    }
  `;
}

function searchBlock(alias: string, query: string): string {
  return `${alias}: search(query: ${literal(query)}, type: ISSUE, first: 0) { issueCount }`;
}

export function buildPortfolioQuery(login: string, repos: RepoQueryInput[]): string {
  const blocks = repos.flatMap((repo) => {
    const full = `${repo.owner}/${repo.name}`;
    const prQuery = `repo:${full} type:pr author:${login}`;
    return [
      repoBlock(repo),
      searchBlock(`${repo.alias}_prs`, prQuery),
      searchBlock(`${repo.alias}_merged`, `${prQuery} is:merged`),
    ];
  });

  return /* GraphQL */ `
    query Portfolio($login: String!, $userId: ID!) {
      user(login: $login) { ${USER_FIELDS} }
      ${blocks.join("\n")}
    }
  `;
}
