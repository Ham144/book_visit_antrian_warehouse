import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export interface LoginResponseDto {
  description: string;
  username: string;
  displayName: string;
  warehouse: object;
  isActive?: boolean;
  refresh_token?: string;
  access_token?: string;
}

export class LoginRequestLdapDto {
  @IsString()
  username: string;

  @IsString()
  @MinLength(5)
  password: string;

  @IsNotEmpty()
  organization: string;
}
