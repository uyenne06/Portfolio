import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge must know the custom type-scale tokens from globals.css; otherwise it reads
 * `text-section` as a colour and drops it when a `text-ink` follows.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["display", "title", "section", "plate", "subtitle", "lede", "figure"] },
      ],
    },
  },
});

/** Merge conditional class names and resolve conflicting Tailwind utilities. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
