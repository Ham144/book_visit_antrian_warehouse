import { Expose } from 'class-transformer';

export class ResponseMyOrganizationSettingsDto {
  @Expose()
  name: string;
  @Expose()
  AD_HOST?: string;
  @Expose()
  AD_PORT?: string;
  @Expose()
  AD_DOMAIN?: string;
  @Expose()
  AD_BASE_DN?: string;
  @Expose()
  disabledFeatures: string[];
  @Expose()
  isConfirmBookRequired: boolean;
}
