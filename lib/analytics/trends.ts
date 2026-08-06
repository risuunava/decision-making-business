import { round } from "@/lib/simulation";

export interface TransactionLike {
  date: string;
  quantity: number;
  unit_price: number;
}

export interface TransactionWithItem extends TransactionLike {
  item_name: string;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface MonthlyVolume {
  month: string;
  quantity: number;
}

export interface TopItem {
  item_name: string;
  revenue: number;
  quantity: number;
}

export interface SummaryStats {
  totalTransactions: number;
  totalRevenue: number;
  totalQuantity: number;
  averageTransactionValue: number;
  averageMonthlyRevenue: number;
}

export function monthKey(date: string): string {
  return date.slice(0, 7);
}

interface MonthAggregate {
  revenue: number;
  quantity: number;
}

function groupByMonth(
  transactions: TransactionLike[]
): Map<string, MonthAggregate> {
  const map = new Map<string, MonthAggregate>();
  for (const transaction of transactions) {
    const key = monthKey(transaction.date);
    const current = map.get(key) ?? { revenue: 0, quantity: 0 };
    current.revenue += transaction.quantity * transaction.unit_price;
    current.quantity += transaction.quantity;
    map.set(key, current);
  }
  return map;
}

function sortedMonths(
  transactions: TransactionLike[]
): { month: string; revenue: number; quantity: number }[] {
  const map = groupByMonth(transactions);
  return [...map.entries()]
    .map(([month, aggregate]) => ({
      month,
      revenue: round(aggregate.revenue),
      quantity: round(aggregate.quantity),
    }))
    .sort((a, b) => a.month.localeCompare(b.month));
}

export function monthlyRevenue(transactions: TransactionLike[]): MonthlyRevenue[] {
  return sortedMonths(transactions).map(({ month, revenue }) => ({
    month,
    revenue,
  }));
}

export function monthlyVolume(transactions: TransactionLike[]): MonthlyVolume[] {
  return sortedMonths(transactions).map(({ month, quantity }) => ({
    month,
    quantity,
  }));
}

export function revenueGrowthPercent(
  currentRevenue: number,
  previousRevenue: number
): number | null {
  if (previousRevenue <= 0) return null;
  return round(((currentRevenue - previousRevenue) / previousRevenue) * 100, 1);
}

export function topItems(
  transactions: TransactionWithItem[],
  limit = 5
): TopItem[] {
  const map = new Map<string, { revenue: number; quantity: number }>();
  for (const transaction of transactions) {
    const name = transaction.item_name ?? "Tidak bernama";
    const current = map.get(name) ?? { revenue: 0, quantity: 0 };
    current.revenue += transaction.quantity * transaction.unit_price;
    current.quantity += transaction.quantity;
    map.set(name, current);
  }
  return [...map.entries()]
    .map(([item_name, aggregate]) => ({
      item_name,
      revenue: round(aggregate.revenue),
      quantity: round(aggregate.quantity),
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export function summaryStats(transactions: TransactionLike[]): SummaryStats {
  const totalRevenue = transactions.reduce(
    (sum, transaction) => sum + transaction.quantity * transaction.unit_price,
    0
  );
  const totalQuantity = transactions.reduce(
    (sum, transaction) => sum + transaction.quantity,
    0
  );
  const months = sortedMonths(transactions);

  return {
    totalTransactions: transactions.length,
    totalRevenue: round(totalRevenue),
    totalQuantity: round(totalQuantity),
    averageTransactionValue:
      transactions.length === 0
        ? 0
        : round(totalRevenue / transactions.length),
    averageMonthlyRevenue:
      months.length === 0
        ? 0
        : round(totalRevenue / months.length),
  };
}
