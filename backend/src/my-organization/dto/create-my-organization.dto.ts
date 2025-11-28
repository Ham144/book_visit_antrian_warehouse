import { LoginResponseDto } from 'src/user/dto/login.dto';

export class CreateMyOrganizationDto {
  name: string;
  subscriptionId: string;
  subscription: SubscriptionPlan;
  AD_HOST?: string;
  AD_PORT?: string;
  AD_DOMAIN?: string;
  AD_BASE_DN?: string;
  accounts: LoginResponseDto[];
}

export enum SubscriptionPlan {
  TRIAL = 'TRIAL',
  PRO = 'PRO',
  PREMIUM = 'PREMIUM',
}
