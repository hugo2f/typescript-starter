import { IsNotEmpty, IsString, IsEnum, IsOptional, IsDate } from 'class-validator';
import { EventStatus } from './event-status.enum';

export class CreateEventDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsString()
  status: EventStatus;

  @IsOptional()
  @IsDate()
  startTime?: Date;

  @IsOptional()
  @IsDate()
  endTime?: Date;
}
