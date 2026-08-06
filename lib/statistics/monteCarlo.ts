import { round } from "@/lib/simulation/engine";

export const MIN_MC_CHANGES = 6;

export function volumeChangeSeries(
  volumes: { month: string; quantity: number }[]
): number[] {
  const changes: number[] = [];
  for (let i = 1; i < volumes.length; i++) {
    const previous = volumes[i - 1].quantity;
    if (previous <= 0) continue;
    changes.push(((volumes[i].quantity - previous) / previous) * 100);
  }
  return changes;
}

export function monteCarloProfit(
  changes: number[],
  currentVolume: number,
  newPrice: number,
  costPerUnit: number,
  iterations = 1000,
  rng: () => number = Math.random
): number[] {
  const profits: number[] = [];
  for (let i = 0; i < iterations; i++) {
    const change = changes[Math.floor(rng() * changes.length)];
    const volume = Math.max(0, currentVolume * (1 + change / 100));
    profits.push(round((newPrice - costPerUnit) * volume));
  }
  return profits.sort((a, b) => a - b);
}

export function percentile(sorted: number[], percent: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.round((percent / 100) * (sorted.length - 1)))
  );
  return sorted[index];
}
