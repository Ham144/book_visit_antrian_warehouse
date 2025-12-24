import { SubscriptionPlan } from 'src/common/shared-enum';

export interface Subscription {
  id: string;
  userusername: string;
  start: Date;
  plan: SubscriptionPlan;
  organizationId: string;
  organizations: Object;
}
