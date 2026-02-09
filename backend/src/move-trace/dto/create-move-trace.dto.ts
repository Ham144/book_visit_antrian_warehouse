import { IsString } from 'class-validator';

export class CreateMoveTraceDto {
  @IsString()
  doer: string;
  @IsString()
  bookingId: string;
  @IsString()
  fromStatus: string;
  @IsString()
  toStatus: string;
  @IsString()
  fromArrivalTime: string;
  @IsString()
  toArrivalTime: string;
  @IsString()
  detailMovement?: string;
}
