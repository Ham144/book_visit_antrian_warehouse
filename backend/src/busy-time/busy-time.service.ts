import { Injectable } from '@nestjs/common';
import { CreateBusyTimeDto } from './dto/create-busy-time.dto';
import { UpdateBusyTimeDto } from './dto/update-busy-time.dto';

@Injectable()
export class BusyTimeService {
  create(createBusyTimeDto: CreateBusyTimeDto) {
    return 'This action adds a new busyTime';
  }

  findAll() {
    return `This action returns all busyTime`;
  }

  findOne(id: number) {
    return `This action returns a #${id} busyTime`;
  }

  update(id: number, updateBusyTimeDto: UpdateBusyTimeDto) {
    return `This action updates a #${id} busyTime`;
  }

  remove(id: number) {
    return `This action removes a #${id} busyTime`;
  }
}
