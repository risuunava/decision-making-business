export type ScenarioType = "pricing" | "discount" | "staffing" | "inventory";

export type BusinessType = "f&b" | "retail" | "jasa" | "lainnya";

export interface PricingInput {
  scenarioType: "pricing";
  currentPrice: number;
  newPrice: number;
  currentVolume: number;
  costPerUnit: number;
  volumeChangePercent: number;
}

export interface DiscountInput {
  scenarioType: "discount";
  currentPrice: number;
  discountPercent: number;
  currentVolume: number;
  costPerUnit: number;
  volumeIncreasePercent: number;
}

export interface StaffingInput {
  scenarioType: "staffing";
  currentMonthlyRevenue: number;
  grossMarginPercent: number;
  additionalMonthlyCost: number;
  revenueIncreasePercent: number;
}

export interface InventoryInput {
  scenarioType: "inventory";
  currentVolume: number;
  unitPrice: number;
  costPerUnit: number;
  stockChangePercent: number;
  salesChangePercent: number;
}

export type ScenarioInput =
  | PricingInput
  | DiscountInput
  | StaffingInput
  | InventoryInput;

export type BreakevenMetric =
  | "maxVolumeDrop"
  | "minVolumeIncrease"
  | "minRevenueIncrease";

export interface BreakevenPoint {
  metric: BreakevenMetric;
  value: number;
  explanation: string;
}

export interface SimulationResult {
  scenarioType: ScenarioType;
  profitBefore: number;
  profitAfter: number;
  profitChange: number;
  profitChangePercent: number;
  marginBefore: number;
  marginAfter: number;
  breakeven: BreakevenPoint | null;
}

export interface SimulationRecord {
  id: string;
  business_id: string;
  scenario_type: ScenarioType;
  input_params: ScenarioInput;
  assumption_source: "manual" | "benchmark" | "estimated";
  result: SimulationResult;
  created_at: string;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  business_type: BusinessType;
  currency: string;
  created_at: string;
}
