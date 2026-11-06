import type { BrandName } from "@/shared/components/ui";
import type { GitHubData } from "@/shared/lib/github";

export type ContactChannelKind = "email" | BrandName;

export type ContactChannel = {
  kind: ContactChannelKind;
  href: string;
  /** Visible handle, e.g. the address or "uyenne06". */
  handle: string;
  reference: string;
};

const SOCIAL_KINDS: Partial<Record<string, BrandName>> = {
  INSTAGRAM: "instagram",
  FACEBOOK: "facebook",
  LINKEDIN: "linkedin",
};

function handleFromUrl(url: string): string {
  const path = new URL(url).pathname.replace(/\/+$/, "");
  return decodeURIComponent(path.split("/").filter(Boolean).pop() ?? url);
}

/**
 * Channels shown in Correspondence: only what the GitHub profile exposes, plus the
 * LinkedIn URL the author provided (cited as owner confirmation).
 */
export function getContactChannels(
  profile: GitHubData["profile"],
  linkedinUrl: string,
): ContactChannel[] {
  const channels: ContactChannel[] = [];

  if (profile.email) {
    channels.push({
      kind: "email",
      href: `mailto:${profile.email}`,
      handle: profile.email,
      reference: "github-profile",
    });
  }
  channels.push({
    kind: "github",
    href: profile.url,
    handle: profile.login,
    reference: "github-profile",
  });

  const socials = profile.socialAccounts.flatMap((account) => {
    const kind = SOCIAL_KINDS[account.provider.toUpperCase()];
    return kind
      ? [
          {
            kind,
            href: account.url,
            handle: handleFromUrl(account.url),
            reference: "github-profile",
          },
        ]
      : [];
  });

  if (!socials.some((channel) => channel.kind === "linkedin")) {
    channels.push({
      kind: "linkedin",
      href: linkedinUrl,
      handle: handleFromUrl(linkedinUrl),
      reference: "owner-confirmation",
    });
  }

  return [...channels, ...socials];
}
