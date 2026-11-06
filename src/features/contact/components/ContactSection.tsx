import { Mail } from "lucide-react";
import { useTranslations } from "next-intl";

import { BrandIcon, Cite, Section } from "@/shared/components/ui";

import type { ContactChannel } from "../services/get-contact-channels";
import { CopyEmailButton } from "./CopyEmailButton";

type ContactSectionProps = {
  channels: ContactChannel[];
  location: string | null;
  number: string;
};

function ChannelIcon({ kind }: { kind: ContactChannel["kind"] }) {
  if (kind === "email") return <Mail className="size-5" aria-hidden="true" strokeWidth={1.5} />;
  return <BrandIcon name={kind} className="size-5" />;
}

export function ContactSection({ channels, location, number }: ContactSectionProps) {
  const t = useTranslations("contact");
  const tSections = useTranslations("sections");
  const [primary, ...others] = channels;

  return (
    <Section
      id="correspondence"
      number={number}
      title={tSections("correspondence")}
      note={
        <p>
          {t("intro")}
          <Cite ids={["profile-readme"]} />
        </p>
      }
    >
      {primary?.kind === "email" ? (
        <div>
          <p className="font-mono text-xs text-muted">{t("email")}</p>
          <p className="mt-3">
            <a
              href={primary.href}
              className="font-display text-plate font-medium break-all decoration-accent-decor decoration-[0.06em] underline-offset-[0.15em] hover:text-accent hover:underline"
            >
              {primary.handle}
            </a>
            <Cite ids={[primary.reference]} />
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <CopyEmailButton
              email={primary.handle}
              copyLabel={t("copy")}
              copiedLabel={t("copied")}
            />
          </div>
        </div>
      ) : null}

      <ul className="mt-14 grid grid-cols-1 gap-x-10 border-t border-ink sm:grid-cols-2">
        {(primary?.kind === "email" ? others : channels).map((channel) => (
          <li key={channel.href} className="min-w-0 border-b border-rule">
            <a
              href={channel.href}
              target="_blank"
              rel="noreferrer me"
              className="group flex items-center gap-4 py-4"
            >
              <span className="text-muted transition-colors group-hover:text-accent">
                <ChannelIcon kind={channel.kind} />
              </span>
              <span className="font-medium">{t(channel.kind)}</span>
              <span className="ml-auto min-w-0 truncate font-mono text-xs text-muted">
                {channel.handle}
              </span>
            </a>
          </li>
        ))}
      </ul>

      {location ? (
        <p className="mt-8 text-sm text-muted">
          {t("location", { location })}
          <Cite ids={["github-profile"]} />
        </p>
      ) : null}
    </Section>
  );
}
