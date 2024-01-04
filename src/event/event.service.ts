import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { User } from '../user/user.entity';
import { CreateEventDto } from './create-event.dto';
import { Event } from './event.entity';
import { EventStatus } from './event-status.enum'

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Event)
    private eventRepository: Repository<Event>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getEvents(): Promise<Event[]> {
    return this.eventRepository.find({ relations: ['invitees'] });
  }

  async createEvent(createEventDto: CreateEventDto): Promise<Event> {
    // check status is valid
    const { status } = createEventDto;
    if (!Object.values(EventStatus).includes(status)) {
      throw new BadRequestException(`Invalid status: ${status}`);
    }
    const event = this.eventRepository.create(createEventDto);
    return this.eventRepository.save(event);
  }

  async getById(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({ where: { id } });
    if (!event) {
      throw new NotFoundException('Id not found');
    }
    return event;
  }

  async deleteById(id: string): Promise<void> {
    const event = await this.getById(id);

    // delete event from invited users
    if (event.invitees && event.invitees.length > 0) {
      event.invitees.forEach(async (user) => {
        user.events = user.events.filter((e) => e !== event.title);
        await this.userRepository.save(user);
      });
    }
    await this.eventRepository.remove(event);
  }

  async inviteUsers(eventTitle: string, userNames: string[]): Promise<void> {
    const event = await this.eventRepository.findOne({ where: { title: eventTitle }, relations: ['invitees'] });
    if (!event) {
      throw new NotFoundException(`Event title '${eventTitle}' not found`);
    }
  
    const users = await this.userRepository.find({ where: { name: In(userNames) } });
    if (users.length === 0) {
      throw new NotFoundException("No users found");
    }
  
    // Filter out existing invitees
    const newInvitees = users.filter(user => !event.invitees.some(existingInvitee => existingInvitee.id === user.id));
  
    // Update the event's invitees
    event.invitees = event.invitees.concat(newInvitees);
    // console.log(event.invitees);
    await this.eventRepository.save(event);
  
    // Update each user's events
    await Promise.all(newInvitees.map(async (user) => {
      // console.log(user.events);
      if (!user.events) user.events = [];
      user.events = [...user.events, event.title];
      await this.userRepository.save(user);
    }));
  }
  
  async deleteAll(): Promise<void> {
    await this.eventRepository.clear();
    await this.userRepository.clear();
  }
}
