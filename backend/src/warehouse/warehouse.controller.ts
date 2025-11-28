import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { Auth } from 'src/common/auth.decorator';
import { CreateWarehouseDto } from './dto/create-warehouse.dto';
import { UpdateWarehouseDto } from './dto/update-warehouse.dto';
import { LoginResponseDto } from 'src/user/dto/login.dto';
import {
  accessTokenOption,
  refreshTokenOption,
} from 'src/user/tokenCookieOptions';

@Controller('/warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Post()
  createWarehouse(@Body() body: CreateWarehouseDto, @Auth() userInfo: any) {
    return this.warehouseService.createWarehouse(body, userInfo);
  }

  @Get('detail/:id')
  getWarehouseDetail(@Param('id') id: string) {
    return this.warehouseService.getWarehouseDetail(id);
  }

  @Get()
  list(@Query() filter: any, @Auth() userInfo: any) {
    return this.warehouseService.getWarehouses(
      userInfo,
      filter.searchKey,
      filter.page,
    );
  }

  @Get('my-access-warehouses')
  getMyAccessWarehouses(@Auth() userInfo: any) {
    return this.warehouseService.getAccessWarehouses(userInfo);
  }

  @Patch(':id')
  updateWarehouse(@Param('id') id: string, @Body() body: UpdateWarehouseDto) {
    return this.warehouseService.updateWarehouse(id, body);
  }

  @Post('switch-homeWarehouse')
  async switchHomeWarehouse(
    @Body('id') id: string,
    @Auth() userInfo: any,
    @Req() req: Request,
    @Res({ passthrough: true }) res: any,
  ) {
    const response: LoginResponseDto =
      await this.warehouseService.switchHomeWarehouse(id, userInfo, req);

    const hasTokens = response.refresh_token && response.access_token;

    if (hasTokens) {
      res.cookie('refresh_token', response.refresh_token, refreshTokenOption);
      res.cookie('access_token', response.access_token, accessTokenOption);
    }

    // Hapus token dari response body
    const { refresh_token, access_token, ...responseWithoutTokens } = response;

    return responseWithoutTokens;
  }

  @Delete(':id')
  deleteWarehouse(@Param('id') id: string) {
    return this.warehouseService.deleteWarehouse(id);
  }
}
