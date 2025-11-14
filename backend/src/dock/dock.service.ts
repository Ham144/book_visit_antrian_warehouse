import { Injectable } from '@nestjs/common';
import { CreateDockDto } from './dto/create-dock.dto';
import { UpdateDockDto } from './dto/update-dock.dto';

@Injectable()
export class DockService {
  create(createDockDto: CreateDockDto) {
    return 'This action adds a new dock';
  }

  findAll() {
    return `This action returns all dock`;
  }

  findOne(id: number) {
    return `This action returns a #${id} dock`;
  }

  update(id: number, updateDockDto: UpdateDockDto) {
    return `This action updates a #${id} dock`;
  }

  remove(id: number) {
    return `This action removes a #${id} dock`;
  }
}
