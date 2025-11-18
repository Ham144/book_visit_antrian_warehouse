export interface Subscription {
  id: string;
  userusername: string;
  start: Date;
  plan: SubscriptionPlan;
  organizationId: string;
  organizations: Object;
}

export enum SubscriptionPlan {
  TRIAL,
  PRO,
  PREMIUM,
}
