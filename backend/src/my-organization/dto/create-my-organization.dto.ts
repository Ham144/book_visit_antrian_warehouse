export class CreateMyOrganizationDto {
  name: string;
  subscriptionId: string;
  subscription: SubscriptionPlan;
  AD_HOST?: string;
  AD_PORT?: string;
  AD_DOMAIN?: string;
  AD_BASE_DN?: string;
}

export enum SubscriptionPlan {
  TRIAL = 'TRIAL',
  PRO = 'PRO',
  PREMIUM = 'PREMIUM',
}
