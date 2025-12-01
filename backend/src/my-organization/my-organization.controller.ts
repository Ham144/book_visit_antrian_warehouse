import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { MyOrganizationService } from './my-organization.service';
import { CreateMyOrganizationDto } from './dto/create-my-organization.dto';
import { UpdateMyOrganizationDto } from './dto/update-my-organization.dto';
import { Auth } from 'src/common/auth.decorator';
import { TokenPayload } from 'src/user/dto/token-payload.dto';
import { LoginResponseDto } from 'src/user/dto/login.dto';
import { AuthService } from 'src/user/auth.service';
import {
  accessTokenOption,
  refreshTokenOption,
} from 'src/user/tokenCookieOptions';

@Controller('organization')
export class MyOrganizationController {
  constructor(
    private readonly myOrganizationService: MyOrganizationService,
    private readonly authService: AuthService,
  ) {}

  @Post()
  create(@Body() createMyOrganizationDto: CreateMyOrganizationDto) {
    return this.myOrganizationService.create(createMyOrganizationDto);
  }

  @Post('switch')
  async switchOrganization(
    @Body('name') name: string,
    @Auth() userInfo: TokenPayload,
    @Res({ passthrough: true }) res: any,
    @Req() req: any,
  ) {
    const response: LoginResponseDto =
      await this.myOrganizationService.switchOrganization(name, userInfo, req);

    const { access_token, refresh_token, ...responseWithoutTokens } = response;

    if (response.refresh_token && response.access_token) {
      res.cookie('refresh_token', response.refresh_token, refreshTokenOption);
      res.cookie('access_token', response.access_token, accessTokenOption);
    }
    return responseWithoutTokens;
  }

  @Get()
  getAllOrganizations(@Query() filter, @Auth() userInfo: TokenPayload) {
    return this.myOrganizationService.getAllOrganizations(filter, userInfo);
  }

  @Get('my-organizations')
  getMyOrganization(@Auth() userInfo: TokenPayload) {
    return this.myOrganizationService.getMyOrganizations(userInfo);
  }

  @Get(':name')
  findOne(@Param('name') name: string) {
    return this.myOrganizationService.findOne(name);
  }

  @Patch(':name')
  update(
    @Param('name') name: string,
    @Body() updateMyOrganizationDto: UpdateMyOrganizationDto,
  ) {
    return this.myOrganizationService.update(name, updateMyOrganizationDto);
  }

  @Delete(':name')
  remove(@Param('name') name: string, @Auth() userInfo: TokenPayload) {
    return this.myOrganizationService.remove(name, userInfo);
  }
}
