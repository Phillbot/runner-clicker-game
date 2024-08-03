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

export enum InitScaleValueLevel {
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

export enum RegenValueLevel {
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

export const ClickCostLevelMax = 20;
export const InitScaleValueLevelMax = 10;
export const RegenValueLevelMax = 10;

export function getClickCost(level: ClickCostLevel): number {
  return 5 * (level - 1) + 1;
}

export function getInitScaleValue(level: InitScaleValueLevel): number {
  return 2500 * (level - 1) + 1000;
}

export function getRegenValue(level: RegenValueLevel): number {
  return 5 * (level - 1) + 1;
}
