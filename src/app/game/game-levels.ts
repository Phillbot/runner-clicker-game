export enum AbilityType {
  ClickCost,
  EnergyLimit,
  EnergyRegen,
}

export interface Abilities {
  clickCoastLevel: ClickCostLevel;
  energyLevel: EnergyValueLevel;
  energyRegenirationLevel: EnergyRegenLevel;
}

export enum ClickCostLevel {
  LEVEL_1 = 1,
  LEVEL_2 = 2,
  LEVEL_3 = 3,
  LEVEL_4 = 4,
  LEVEL_5 = 5,
  LEVEL_6 = 6,
  LEVEL_7 = 7,
  LEVEL_8 = 8,
  LEVEL_9 = 9,
  LEVEL_10 = 10,
  LEVEL_11 = 11,
  LEVEL_12 = 12,
  LEVEL_13 = 13,
  LEVEL_14 = 14,
  LEVEL_15 = 15,
  LEVEL_16 = 16,
  LEVEL_17 = 17,
  LEVEL_18 = 18,
  LEVEL_19 = 19,
  LEVEL_20 = 20,
}

export enum EnergyValueLevel {
  LEVEL_1 = 1,
  LEVEL_2 = 2,
  LEVEL_3 = 3,
  LEVEL_4 = 4,
  LEVEL_5 = 5,
  LEVEL_6 = 6,
  LEVEL_7 = 7,
  LEVEL_8 = 8,
  LEVEL_9 = 9,
  LEVEL_10 = 10,
}

export enum EnergyRegenLevel {
  LEVEL_1 = 1,
  LEVEL_2 = 2,
  LEVEL_3 = 3,
  LEVEL_4 = 4,
  LEVEL_5 = 5,
}

export const ClickCostLevelMax = 20;
export const EnergyValueLevelMax = 10;
export const EnergyRegenLevelMax = 5;

const clickCoefficient = 1;
const energyCoefficient = 1000;
const energyRegenCoefficient = 0.11;

const CLICK_COST_LEVEL_COST: Record<ClickCostLevel, number> = {
  [ClickCostLevel.LEVEL_1]: 0,
  [ClickCostLevel.LEVEL_2]: 1000,
  [ClickCostLevel.LEVEL_3]: 2000,
  [ClickCostLevel.LEVEL_4]: 4000,
  [ClickCostLevel.LEVEL_5]: 8000,
  [ClickCostLevel.LEVEL_6]: 12500,
  [ClickCostLevel.LEVEL_7]: 15000,
  [ClickCostLevel.LEVEL_8]: 17500,
  [ClickCostLevel.LEVEL_9]: 20000,
  [ClickCostLevel.LEVEL_10]: 30000,
  [ClickCostLevel.LEVEL_11]: 50000,
  [ClickCostLevel.LEVEL_12]: 100000,
  [ClickCostLevel.LEVEL_13]: 125000,
  [ClickCostLevel.LEVEL_14]: 150000,
  [ClickCostLevel.LEVEL_15]: 175000,
  [ClickCostLevel.LEVEL_16]: 200000,
  [ClickCostLevel.LEVEL_17]: 350000,
  [ClickCostLevel.LEVEL_18]: 500000,
  [ClickCostLevel.LEVEL_19]: 750000,
  [ClickCostLevel.LEVEL_20]: 1000000,
};

const ENERGY_VALUE_LEVEL_COST: Record<EnergyValueLevel, number> = {
  [EnergyValueLevel.LEVEL_1]: 0,
  [EnergyValueLevel.LEVEL_2]: 5000,
  [EnergyValueLevel.LEVEL_3]: 10000,
  [EnergyValueLevel.LEVEL_4]: 15000,
  [EnergyValueLevel.LEVEL_5]: 20000,
  [EnergyValueLevel.LEVEL_6]: 25000,
  [EnergyValueLevel.LEVEL_7]: 50000,
  [EnergyValueLevel.LEVEL_8]: 75000,
  [EnergyValueLevel.LEVEL_9]: 100000,
  [EnergyValueLevel.LEVEL_10]: 125000,
};

const ENERGY_REGEN_LEVEL_COST: Record<EnergyRegenLevel, number> = {
  [EnergyRegenLevel.LEVEL_1]: 0,
  [EnergyRegenLevel.LEVEL_2]: 15000,
  [EnergyRegenLevel.LEVEL_3]: 20000,
  [EnergyRegenLevel.LEVEL_4]: 25000,
  [EnergyRegenLevel.LEVEL_5]: 50000,
};

export function getClickCostByLevel(level: ClickCostLevel): number {
  return Math.round(level * clickCoefficient);
}

export function getEnergyValueByLevel(level: EnergyValueLevel): number {
  return Math.round(level * energyCoefficient);
}

export function getEnergyRegenValueByLevel(level: EnergyRegenLevel): number {
  return Number((level * energyRegenCoefficient).toFixed(2));
}

export function getClickCostUpdateLevelCost(level: ClickCostLevel): number {
  return CLICK_COST_LEVEL_COST[level] ?? 0;
}

export function getEnergyValueUpdateLevelCost(level: EnergyValueLevel): number {
  return ENERGY_VALUE_LEVEL_COST[level] ?? 0;
}

export function getEnergyRegenUpgradeLevelCost(
  level: EnergyRegenLevel,
): number {
  return ENERGY_REGEN_LEVEL_COST[level] ?? 0;
}
