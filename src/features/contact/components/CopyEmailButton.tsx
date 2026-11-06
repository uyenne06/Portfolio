"use client";

import { Check, Copy } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { cn } from "@/shared/utils";

type CopyEmailButtonProps = { email: string; copyLabel: string; copiedLabel: string };

/** Copies the address and confirms with the same verb ("Copy" → "Copied"). */
export function CopyEmailButton({ email, copyLabel, copiedLabel }: CopyEmailButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
    } catch {
      // Clipboard can be blocked (permissions, insecure context); the mailto link still works.
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors",
        copied
          ? "border-accent-decor bg-accent-decor text-on-accent"
          : "border-ink/80 text-ink hover:border-accent hover:text-accent",
      )}
    >
      {copied ? (
        <Check className="size-4" aria-hidden="true" strokeWidth={2} />
      ) : (
        <Copy className="size-4" aria-hidden="true" strokeWidth={1.5} />
      )}
      <span aria-live="polite" className="relative inline-flex overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={copied ? "copied" : "copy"}
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "-100%", opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            {copied ? copiedLabel : copyLabel}
          </motion.span>
        </AnimatePresence>
      </span>
    </button>
  );
}
