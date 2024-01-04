import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToMany, JoinTable } from 'typeorm';
import { IsNotEmpty, IsString, IsOptional, IsDate } from 'class-validator';
import { EventStatus } from './event-status.enum';
import { User } from '../user/user.entity';
import * as moment from 'moment';

@Entity()
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 50 })
  @IsNotEmpty()
  @IsString()
  title: string;

  @Column({ length: 300, nullable: true })
  @IsOptional()
  @IsString()
  description: string;

  @Column({ type: 'varchar', length: 20, default: EventStatus.TODO })
  @IsString()
  status: EventStatus;

  @CreateDateColumn({ type: 'varchar', length: 20, default: () => `'${moment().format()}'` })
  @IsString()
  createdAt: string;

  @UpdateDateColumn({ type: 'varchar', length: 20, default: () => `'${moment().format()}'` })
  @IsString()
  updatedAt: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @IsOptional()
  @IsDate()
  startTime: Date;

  @Column({ type: 'varchar', length: 20, nullable: true })
  @IsOptional()
  @IsDate()
  endTime: Date;

  @ManyToMany(() => User, { cascade: true })
  @JoinTable()
  invitees: User[];

  constructor() {
    this.createdAt = moment().format();
    this.updatedAt = moment().format();
  }
}
