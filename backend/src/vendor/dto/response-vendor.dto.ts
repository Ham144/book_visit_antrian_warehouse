import { Expose } from 'class-transformer';
import { ResponseMyOrganizationDto } from 'src/my-organization/dto/response-my-organization.dto';
import { LoginResponseDto } from 'src/user/dto/login.dto';

export class ResponseVendorDto {
  @Expose()
  name?: string;

  @Expose({ groups: ['detail'] })
  members: LoginResponseDto[];

  @Expose({ groups: ['detail'] })
  organization?: ResponseMyOrganizationDto;
}
