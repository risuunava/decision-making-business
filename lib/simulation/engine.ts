import type {
  BreakevenPoint,
  DiscountInput,
  InventoryInput,
  PricingInput,
  ScenarioInput,
  SimulationResult,
  StaffingInput,
} from "@/types";

export function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round((value + Number.EPSILON) * factor) / factor;
}

export function calculateProfit(
  price: number,
  costPerUnit: number,
  volume: number
): number {
  return round((price - costPerUnit) * volume);
}

export function calculateMargin(price: number, costPerUnit: number): number {
  if (price <= 0) return 0;
  return round(((price - costPerUnit) / price) * 100);
}

function baseResult(
  scenarioType: SimulationResult["scenarioType"],
  profitBefore: number,
  profitAfter: number,
  marginBefore: number,
  marginAfter: number
): SimulationResult {
  const profitChange = round(profitAfter - profitBefore);
  const profitChangePercent =
    profitBefore === 0 ? 0 : round((profitChange / profitBefore) * 100);
  return {
    scenarioType,
    profitBefore,
    profitAfter,
    profitChange,
    profitChangePercent,
    marginBefore,
    marginAfter,
    breakeven: null,
  };
}

function pricingBreakeven(input: PricingInput): BreakevenPoint | null {
  const contribution = input.newPrice - input.costPerUnit;
  if (contribution <= 0) return null;
  const breakevenVolume = calculateProfit(
    input.currentPrice,
    input.costPerUnit,
    input.currentVolume
  ) / contribution;
  const maxVolumeDrop = ((input.currentVolume - breakevenVolume) / input.currentVolume) * 100;
  return {
    metric: "maxVolumeDrop",
    value: round(maxVolumeDrop),
    explanation:
      "Maksimum penurunan volume penjualan agar profit tidak turun dari sebelum perubahan harga.",
  };
}

function discountBreakeven(input: DiscountInput): BreakevenPoint | null {
  const discountedPrice = input.currentPrice * (1 - input.discountPercent / 100);
  const contribution = discountedPrice - input.costPerUnit;
  if (contribution <= 0) return null;
  const profitBefore = calculateProfit(
    input.currentPrice,
    input.costPerUnit,
    input.currentVolume
  );
  const breakevenVolume = profitBefore / contribution;
  const minVolumeIncrease = ((breakevenVolume - input.currentVolume) / input.currentVolume) * 100;
  return {
    metric: "minVolumeIncrease",
    value: round(minVolumeIncrease),
    explanation:
      "Kenaikan volume penjualan minimum yang diperlukan agar profit setelah diskon tidak turun.",
  };
}

function staffingBreakeven(input: StaffingInput): BreakevenPoint | null {
  if (input.grossMarginPercent <= 0) return null;
  const requiredRevenue = input.additionalMonthlyCost / (input.grossMarginPercent / 100);
  const minRevenueIncrease = (requiredRevenue / input.currentMonthlyRevenue) * 100;
  return {
    metric: "minRevenueIncrease",
    value: round(minRevenueIncrease),
    explanation:
      "Kenaikan omzet minimum yang diperlukan agar tambahan biaya pegawai tertutup.",
  };
}

function inventoryBreakeven(): BreakevenPoint {
  return {
    metric: "maxVolumeDrop",
    value: 0,
    explanation:
      "Setiap penurunan volume penjualan akibat perubahan stok memotong profit secara proporsional. Ambang netral ada di 0%.",
  };
}

function calculatePricing(input: PricingInput): SimulationResult {
  const newVolume = input.currentVolume * (1 + input.volumeChangePercent / 100);
  const profitBefore = calculateProfit(
    input.currentPrice,
    input.costPerUnit,
    input.currentVolume
  );
  const profitAfter = calculateProfit(input.newPrice, input.costPerUnit, newVolume);
  const result = baseResult(
    "pricing",
    profitBefore,
    profitAfter,
    calculateMargin(input.currentPrice, input.costPerUnit),
    calculateMargin(input.newPrice, input.costPerUnit)
  );
  result.breakeven = pricingBreakeven(input);
  return result;
}

function calculateDiscount(input: DiscountInput): SimulationResult {
  const discountedPrice = input.currentPrice * (1 - input.discountPercent / 100);
  const newVolume = input.currentVolume * (1 + input.volumeIncreasePercent / 100);
  const profitBefore = calculateProfit(
    input.currentPrice,
    input.costPerUnit,
    input.currentVolume
  );
  const profitAfter = calculateProfit(discountedPrice, input.costPerUnit, newVolume);
  const result = baseResult(
    "discount",
    profitBefore,
    profitAfter,
    calculateMargin(input.currentPrice, input.costPerUnit),
    calculateMargin(discountedPrice, input.costPerUnit)
  );
  result.breakeven = discountBreakeven(input);
  return result;
}

function calculateStaffing(input: StaffingInput): SimulationResult {
  const margin = input.grossMarginPercent;
  const profitBefore = round(input.currentMonthlyRevenue * (margin / 100));
  const profitAfter = round(
    input.currentMonthlyRevenue * (1 + input.revenueIncreasePercent / 100) * (margin / 100) -
      input.additionalMonthlyCost
  );
  const result = baseResult("staffing", profitBefore, profitAfter, margin, margin);
  result.breakeven = staffingBreakeven(input);
  return result;
}

function calculateInventory(input: InventoryInput): SimulationResult {
  const newVolume = input.currentVolume * (1 + input.salesChangePercent / 100);
  const profitBefore = calculateProfit(input.unitPrice, input.costPerUnit, input.currentVolume);
  const profitAfter = calculateProfit(input.unitPrice, input.costPerUnit, newVolume);
  const result = baseResult(
    "inventory",
    profitBefore,
    profitAfter,
    calculateMargin(input.unitPrice, input.costPerUnit),
    calculateMargin(input.unitPrice, input.costPerUnit)
  );
  result.breakeven = inventoryBreakeven();
  return result;
}

export function calculateProfitImpact(input: ScenarioInput): SimulationResult {
  switch (input.scenarioType) {
    case "pricing":
      return calculatePricing(input);
    case "discount":
      return calculateDiscount(input);
    case "staffing":
      return calculateStaffing(input);
    case "inventory":
      return calculateInventory(input);
  }
}

export function calculateBreakeven(input: ScenarioInput): BreakevenPoint | null {
  return calculateProfitImpact(input).breakeven;
}