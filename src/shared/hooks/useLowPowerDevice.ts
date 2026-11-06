"use client";

import { useSyncExternalStore } from "react";

type NavigatorWithHints = Navigator & {
  connection?: { saveData?: boolean };
  deviceMemory?: number;
};

function detectLowPower(): boolean {
  const nav = navigator as NavigatorWithHints;
  const fewCores = nav.hardwareConcurrency > 0 && nav.hardwareConcurrency <= 4;
  const lowMemory = typeof nav.deviceMemory === "number" && nav.deviceMemory <= 4;
  const saveData = nav.connection?.saveData === true;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  return fewCores || lowMemory || saveData || coarsePointer;
}

const noop = () => () => {};

/** Heuristic for phones / weak hardware: used to render 3D once instead of continuously. */
export function useLowPowerDevice(): boolean {
  return useSyncExternalStore(noop, detectLowPower, () => true);
}
