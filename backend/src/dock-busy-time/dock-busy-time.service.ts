import { Injectable } from '@nestjs/common';
import { CreateDockBusyTimeDto } from './dto/create-dock-busy-time.dto';
import { UpdateDockBusyTimeDto } from './dto/update-dock-busy-time.dto';

@Injectable()
export class DockBusyTimeService {
  create(createDockBusyTimeDto: CreateDockBusyTimeDto) {
    return 'This action adds a new dockBusyTime';
  }

  findAll() {
    return `This action returns all dockBusyTime`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dockBusyTime`;
  }

  update(id: number, updateDockBusyTimeDto: UpdateDockBusyTimeDto) {
    return `This action updates a #${id} dockBusyTime`;
  }

  remove(id: number) {
    return `This action removes a #${id} dockBusyTime`;
  }
}
