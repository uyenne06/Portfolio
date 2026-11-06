"use client";

import { useRef, useState, type CSSProperties, type PointerEvent } from "react";

import { cn } from "@/shared/utils";

export type ElementTileData = {
  label: string;
  symbol: string;
  /** Rank by usage across the whole table (the "atomic number"). */
  rank: number;
  count: number;
  total: number;
  projects: string[];
};

/** Fill encodes how many projects use the tool, like the shading of a printed chart. */
function fillClass(count: number, total: number): string {
  const share = count / Math.max(1, total);
  if (share >= 0.8) return "border-accent-decor bg-accent-decor text-on-accent";
  if (share >= 0.6) return "border-accent-decor bg-accent-soft text-ink";
  if (share >= 0.45) return "hatch border-ink/40 text-ink";
  if (share >= 0.3) return "border-ink bg-paper text-ink";
  return "border-dashed border-ink/40 bg-paper text-ink";
}

type ElementTileProps = {
  tile: ElementTileData;
  index: number;
  state: "normal" | "lit" | "dim";
  labels: { usedIn: string; flip: string };
  onHoverChange: (label: string | null) => void;
};

/**
 * One "element" of the stack. Tilts towards the cursor with a moving glare; selecting it
 * flips the card to show which projects use the tool.
 */
export function ElementTile({ tile, index, state, labels, onHoverChange }: ElementTileProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const [flipped, setFlipped] = useState(false);

  const onPointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const element = ref.current;
    if (!element || event.pointerType !== "mouse") return;
    const box = element.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width;
    const y = (event.clientY - box.top) / box.height;
    element.style.setProperty("--ry", `${((x - 0.5) * 22).toFixed(2)}deg`);
    element.style.setProperty("--rx", `${((0.5 - y) * 22).toFixed(2)}deg`);
    element.style.setProperty("--gx", `${(x * 100).toFixed(1)}%`);
    element.style.setProperty("--gy", `${(y * 100).toFixed(1)}%`);
  };

  const onPointerLeave = () => {
    ref.current?.style.setProperty("--ry", "0deg");
    ref.current?.style.setProperty("--rx", "0deg");
    onHoverChange(null);
  };

  return (
    <div
      className={cn(
        "tile-in transition-[opacity,filter] duration-500 perspective-distant",
        state === "dim" && "opacity-20 grayscale",
      )}
      style={{ "--i": index } as CSSProperties}
    >
      <button
        ref={ref}
        type="button"
        aria-pressed={flipped}
        aria-label={`${tile.label} (${tile.symbol}). ${labels.usedIn}`}
        title={labels.flip}
        onClick={() => setFlipped((value) => !value)}
        onPointerEnter={() => onHoverChange(tile.label)}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        onFocus={() => onHoverChange(tile.label)}
        onBlur={() => onHoverChange(null)}
        className={cn(
          "group/tile relative block aspect-square w-full transition-transform duration-700 ease-paper transform-3d",
          state === "lit" && "z-10 scale-105",
        )}
        style={{
          transform: `rotateX(var(--rx, 0deg)) rotateY(calc(var(--ry, 0deg) + ${flipped ? 180 : 0}deg))`,
        }}
      >
        {/* Front: the element */}
        <span
          className={cn(
            "absolute inset-0 flex flex-col justify-between overflow-hidden rounded-md border p-2 text-left backface-hidden",
            fillClass(tile.count, tile.total),
            state === "lit" && "ring-2 ring-accent ring-offset-2 ring-offset-paper",
          )}
        >
          <span className="flex items-start justify-between font-mono text-xs leading-none opacity-80">
            <span>{tile.rank}</span>
            <span>
              {tile.count}/{tile.total}
            </span>
          </span>
          <span className="font-display text-3xl leading-none font-medium tracking-tight sm:text-4xl">
            {tile.symbol}
          </span>
          <span className="truncate text-xs leading-tight">{tile.label}</span>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/tile:opacity-100"
            style={{
              background:
                "radial-gradient(circle at var(--gx, 50%) var(--gy, 50%), rgba(255, 255, 255, 0.55), transparent 60%)",
            }}
          />
        </span>

        {/* Back: where it is used */}
        <span className="absolute inset-0 flex rotate-y-180 flex-col justify-between overflow-hidden rounded-md border border-ink bg-ink p-2 text-left text-paper backface-hidden">
          <span className="font-mono text-xs leading-none text-accent-decor">{tile.symbol}</span>
          <span className="space-y-0.5 text-xs leading-tight">
            {tile.projects.map((project) => (
              <span key={project} className="block truncate">
                {project}
              </span>
            ))}
          </span>
        </span>
      </button>
    </div>
  );
}
