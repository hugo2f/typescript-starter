import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { CreateEventDto } from './create-event.dto';
import { EventService } from './event.service';

@Controller('events')
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @Get()
  getEvents() {
    return this.eventService.getEvents();
  }

  @Post()
  async createEvent(@Body() createEventDto: CreateEventDto) {
    return await this.eventService.createEvent(createEventDto);
  }
  // async createEvent(@Body() eventData: Partial<Event>): Promise<Event> {
  //   return this.eventService.createEventWithDefaultInvitees(eventData);
  // }

  @Post('getById')
  getEventById(@Body() body: { eventId: string }) {
    const { eventId } = body;
    return this.eventService.getById(eventId);
  }

  @Delete('deleteById')
  deleteById(@Body() body: { eventId: string }) {
    const { eventId } = body;
    return this.eventService.deleteById(eventId);
  }

  @Post('invite')
  async inviteUsers(
    @Body() data: { eventTitle: string; userNames: string[] },
  ): Promise<void> {
    const { eventTitle, userNames } = data;
    return this.eventService.inviteUsers(eventTitle, userNames);
  }

  @Delete('delete-all')
  async deleteAll(): Promise<void> {
    await this.eventService.deleteAll();
  }
}
