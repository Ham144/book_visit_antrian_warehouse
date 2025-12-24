import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Delete,
  Req,
  Res,
  Query,
  ParseIntPipe,
  Param,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { refreshTokenOption, accessTokenOption } from './tokenCookieOptions';
import { LoginResponseDto, LoginRequestDto } from './dto/login.dto';
import { CreateAppUserDto } from './dto/create-user.dto';
import { UserService } from './user.service';
import { AuthService } from './auth.service';
import { UpdateAppUserDto } from './dto/update-user.dto';
import { Auth } from 'src/common/auth.decorator';
import { TokenPayload } from './dto/token-payload.dto';
import { Authorization } from 'src/common/authorization.decorator';
import { ROLE } from 'src/common/shared-enum';

@Controller('/user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService,
  ) {}

  @Post('/login/ldap')
  async loginUserLdap(
    @Body() body: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const response: LoginResponseDto = await this.authService.loginUserAD(
      body,
      req,
    );
    const hasTokens = response.refresh_token && response.access_token;

    if (hasTokens) {
      res.cookie('refresh_token', response.refresh_token, refreshTokenOption);
      res.cookie('access_token', response.access_token, accessTokenOption);
    }

    // Hapus token dari response body
    const { refresh_token, access_token, ...responseWithoutTokens } = response;

    return responseWithoutTokens;
  }

  @Post('/login/app')
  async loginUserApp(
    @Body() body: LoginRequestDto,
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const response: LoginResponseDto = await this.authService.loginUserAPP(
      body,
      req,
    );
    const hasTokens = response.refresh_token && response.access_token;

    if (hasTokens) {
      res.cookie('refresh_token', response.refresh_token, refreshTokenOption);
      res.cookie('access_token', response.access_token, accessTokenOption);
    }

    // Hapus token dari response body
    const { refresh_token, access_token, ...responseWithoutTokens } = response;

    return responseWithoutTokens;
  }

  @Post('/refresh-token')
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req?.cookies['refresh_token'];

    if (!refreshToken) {
      res.status(401);
      return { message: 'No refresh token' };
    }
    const { access_token, refresh_token: new_refresh_token } =
      await this.authService.refreshToken(refreshToken);

    res.cookie('refresh_token', new_refresh_token, refreshTokenOption);
    res.cookie('access_token', access_token, accessTokenOption);

    return {
      message: 'Refresh token updated',
    };
  }

  @Authorization('DRIVER_VENDOR', 'ADMIN_ORGANIZATION')
  @Get('/get-user-info')
  async getUserInfo(@Req() req: Request) {
    return this.authService.getUserInfo(req);
  }

  @Authorization(ROLE.ADMIN_ORGANIZATION)
  @Get('/list')
  async getAllAccount(
    @Query('page', ParseIntPipe) page: number,
    @Query('searchKey') searchKey: string,
  ) {
    return this.userService.getAllAccount(page, searchKey);
  }

  @Authorization(ROLE.ADMIN_VENDOR, ROLE.ADMIN_ORGANIZATION)
  @Get('/my-drivers')
  async getMyDrivers(
    @Query('page', ParseIntPipe) page: number,
    @Query('searchKey') searchKey: string,
    @Auth() userInfo: TokenPayload,
  ) {
    return this.userService.getMyDrivers(page, searchKey, userInfo);
  }

  @Authorization(ROLE.ADMIN_ORGANIZATION)
  @Get('/list-member-management')
  async getAllAccountForMemberManagement(
    @Query('page', ParseIntPipe) page: number,
    @Query('searchKey') searchKey: string,
  ) {
    return this.userService.getAllAccountForMemberManagement(page, searchKey);
  }

  @Authorization('ADMIN_VENDOR')
  @Get('/list-member-vendor')
  async getVendorMemberOnly(
    @Query('page', ParseIntPipe) page: number,
    @Query('searchKey') searchKey: string,
    @Auth() userInfo: TokenPayload,
  ) {
    return this.userService.getVendorMemberOnly(page, searchKey, userInfo);
  }

  @Authorization('ADMIN_VENDOR', 'ADMIN_ORGANIZATION')
  @Post('/create')
  async createAppUser(
    @Body() body: CreateAppUserDto,
    @Auth() userInfo: TokenPayload,
  ) {
    return this.userService.createAppUser(body, userInfo);
  }

  @Authorization('ADMIN_ORGANIZATION', 'ADMIN_VENDOR')
  @Patch('/update')
  async updateAccount(@Body() body: UpdateAppUserDto) {
    return this.userService.updateAccount(body);
  }

  @Authorization()
  @Delete('/logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const access_token = req?.cookies['access_token'];
    await this.authService.logout(access_token, req);
    res.clearCookie('access_token', { path: '/' });
    res.clearCookie('refresh_token', { path: '/' });
    return { message: 'Logout success' };
  }

  @Authorization('ADMIN_VENDOR', 'ADMIN_ORGANIZATION')
  @Delete('/delete/:username')
  async deleteAppUser(@Param('username') username: string) {
    return this.userService.deleteAppUser(username);
  }
}
