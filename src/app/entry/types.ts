export enum UserStatus {
  ACTIVE = 1,
  BANNED = 2,
  BLOCKED = 3,
}

export type User = {
  id: number;
  isBot: boolean;
  firstName: string;
  lastName?: string;
  userName?: string;
  languageCode?: string;
  isPremium?: boolean;
  balance: number;
  status: number;
  referralId?: number;
  abilities: AbilitiesMapping;
  activeEnergy: ActiveEnergyMapping;
  lastLogout?: number;
  referrals: Referral[];
  boost?: BoostMapping;
};

export type Bot = {
  canConnectToBusiness: boolean | undefined;
  canJoinGroups: boolean;
  canReadAllGroupMessages: boolean;
  firstName: string;
  id: number;
  isBot: boolean;
  supportsInlineQueries: boolean;
  username: string;
};

export type AbilitiesMapping = {
  clickCoastLevel: number;
  energyLevel: number;
  energyRegenirationLevel: number;
};

export type ActiveEnergyMapping = {
  availablePoints: number;
};

export type BoostMapping = {
  lastBoostRun?: number;
};

export type Referral = {
  userId: number;
  regData: number;
  userName: string | null;
  firstName: string | null;
  userStatus: number;
  balance: number;
  referralId: number | null;
  rewardClaim: boolean | undefined;
};
