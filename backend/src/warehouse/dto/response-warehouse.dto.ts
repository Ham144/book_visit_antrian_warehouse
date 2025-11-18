import { Exclude } from 'class-transformer';

export class responseWarehouseDto {
  id: string;
  name: string;
  location?: string | null;
  description?: string | null;
  @Exclude() //dipakai untuk menyembunyikan field dgn excludeExtraneousValues:true
  budgets?: object[];
  @Exclude()
  flowLogs?: object[];
  @Exclude()
  members?: object[];
  @Exclude()
  docks?: object[];
  @Exclude()
  bookings?: object[];
  @Exclude()
  createdAt?: Date;
  @Exclude()
  updatedAt?: Date;
}
