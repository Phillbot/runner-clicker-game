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
