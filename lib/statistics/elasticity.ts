import { round } from "@/lib/simulation/engine";
import type { TransactionWithItem } from "@/lib/analytics/trends";

export const MIN_PRICE_POINTS = 2;
export const MIN_OBSERVATIONS = 3;

interface PriceVolumeObservation {
  month: string;
  price: number;
  quantity: number;
}

export interface ElasticityEstimate {
  itemName: string;
  elasticity: number;
  rSquared: number;
  n: number;
}

export function priceVolumePairs(
  transactions: TransactionWithItem[]
): Map<string, PriceVolumeObservation[]> {
  const byItem = new Map<
    string,
    Map<string, { revenue: number; quantity: number }>
  >();
  for (const transaction of transactions) {
    const month = transaction.date.slice(0, 7);
    const itemMap = byItem.get(transaction.item_name) ?? new Map();
    const aggregate = itemMap.get(month) ?? { revenue: 0, quantity: 0 };
    aggregate.revenue += transaction.quantity * transaction.unit_price;
    aggregate.quantity += transaction.quantity;
    itemMap.set(month, aggregate);
    byItem.set(transaction.item_name, itemMap);
  }

  const result = new Map<string, PriceVolumeObservation[]>();
  for (const [itemName, itemMap] of byItem) {
    const pairs = [...itemMap.entries()]
      .map(([month, aggregate]) => ({
        month,
        price: round(aggregate.revenue / aggregate.quantity),
        quantity: round(aggregate.quantity),
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
    result.set(itemName, pairs);
  }
  return result;
}

export function estimateElasticity(
  itemName: string,
  pairs: PriceVolumeObservation[]
): ElasticityEstimate | null {
  const usable = pairs.filter((pair) => pair.price > 0 && pair.quantity > 0);
  if (usable.length < MIN_OBSERVATIONS) return null;
  if (new Set(usable.map((pair) => pair.price)).size < MIN_PRICE_POINTS) {
    return null;
  }

  const xs = usable.map((pair) => Math.log(pair.price));
  const ys = usable.map((pair) => Math.log(pair.quantity));
  const meanX = xs.reduce((sum, value) => sum + value, 0) / xs.length;
  const meanY = ys.reduce((sum, value) => sum + value, 0) / ys.length;

  let covariance = 0;
  let varianceX = 0;
  let varianceY = 0;
  for (let i = 0; i < xs.length; i++) {
    const dx = xs[i] - meanX;
    const dy = ys[i] - meanY;
    covariance += dx * dy;
    varianceX += dx * dx;
    varianceY += dy * dy;
  }
  if (varianceX === 0 || varianceY === 0) return null;

  const elasticity = covariance / varianceX;
  const rSquared = Math.min(1, (covariance * covariance) / (varianceX * varianceY));

  return {
    itemName,
    elasticity: round(elasticity, 2),
    rSquared: round(rSquared, 2),
    n: usable.length,
  };
}
