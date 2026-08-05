import { z } from "zod";
import type { ScenarioInput, ScenarioType } from "@/types";

const money = (min = 0) => z.number().finite().min(min);

export const pricingSchema = z.object({
  scenarioType: z.literal("pricing"),
  currentPrice: money(1),
  newPrice: money(1),
  currentVolume: money(1),
  costPerUnit: money(0),
  volumeChangePercent: money(-99.99),
});

export const discountSchema = z.object({
  scenarioType: z.literal("discount"),
  currentPrice: money(1),
  discountPercent: z.number().finite().min(0).max(95),
  currentVolume: money(1),
  costPerUnit: money(0),
  volumeIncreasePercent: money(0),
});

export const staffingSchema = z.object({
  scenarioType: z.literal("staffing"),
  currentMonthlyRevenue: money(1),
  grossMarginPercent: z.number().finite().min(0).max(90),
  additionalMonthlyCost: money(0),
  revenueIncreasePercent: money(0),
});

export const inventorySchema = z.object({
  scenarioType: z.literal("inventory"),
  currentVolume: money(1),
  unitPrice: money(1),
  costPerUnit: money(0),
  stockChangePercent: money(-100),
  salesChangePercent: money(-100),
});

export const scenarioSchema = z.discriminatedUnion("scenarioType", [
  pricingSchema,
  discountSchema,
  staffingSchema,
  inventorySchema,
]);

export const scenarioTypeSchema = z.enum([
  "pricing",
  "discount",
  "staffing",
  "inventory",
]);

export function isScenarioType(value: string): value is ScenarioType {
  return scenarioTypeSchema.safeParse(value).success;
}

export function parseScenarioInput(input: unknown): ScenarioInput {
  return scenarioSchema.parse(input);
}

export type { ScenarioType };