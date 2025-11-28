export interface BaseProps {
  page?: number;
  searchKey?: string;
}

export enum SubscriptionPlan {
  TRIAL = "TRIAL",
  PRO = "PRO",
  PREMIUM = "PREMIUM",
}
