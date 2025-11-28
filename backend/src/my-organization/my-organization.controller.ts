import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { MyOrganizationService } from './my-organization.service';
import { CreateMyOrganizationDto } from './dto/create-my-organization.dto';
import { UpdateMyOrganizationDto } from './dto/update-my-organization.dto';
import { Auth } from 'src/common/auth.decorator';
import { TokenPayload } from 'src/user/dto/token-payload.dto';

@Controller('organization')
export class MyOrganizationController {
  constructor(private readonly myOrganizationService: MyOrganizationService) {}

  @Post()
  create(@Body() createMyOrganizationDto: CreateMyOrganizationDto) {
    return this.myOrganizationService.create(createMyOrganizationDto);
  }

  @Post('switch')
  switchOrganization(@Body() id: string) {
    return;
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
