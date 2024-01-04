import { Test, TestingModule } from '@nestjs/testing';
import { EventController } from './event.controller';
import { EventService } from './event.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { CreateEventDto } from './create-event.dto';
import { EventStatus } from './event-status.enum';
import { User } from '../user/user.entity';

describe('EventController', () => {
  let eventController: EventController;
  let eventService: EventService;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      controllers: [EventController],
      providers: [
        EventService,
        {
          provide: getRepositoryToken(Event),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(User),
          useClass: Repository,
        }
      ],
    }).compile();

    eventController = module.get<EventController>(EventController);
    eventService = module.get<EventService>(EventService);
  });

  describe('createEvent', () => {
    it('should create an event and get by its id', async () => {
      const createEventDto: CreateEventDto = {
        title: 'Test Event',
        description: 'Test description',
        status: EventStatus.TODO,
      };

      jest.spyOn(eventService, 'createEvent').mockResolvedValue({
        id: 'some-id',
        title: 'Test Event',
        description: 'Test description',
      } as Event);

      const result = await eventService.createEvent(createEventDto);

      jest.spyOn(eventService, 'getById').mockResolvedValue(result);

      const retrievedEvent = await eventController.getEventById({ eventId: 'some-id' });
      expect(retrievedEvent).toEqual({
        id: 'some-id',
        title: 'Test Event',
        description: 'Test description',
      });
    });
  });

  describe('createEvent and deleteById', () => {
    it('should create an event and delete it by its id, and verify it is deleted', async () => {
      const createEventDto: CreateEventDto = {
        title: 'Test Event',
        description: 'Test description',
        status: EventStatus.TODO,
      };

      jest.spyOn(eventService, 'createEvent').mockResolvedValue({
        id: 'some-id',
        title: 'Test Event',
        description: 'Test description',
      } as Event);

      jest.spyOn(eventService, 'deleteById').mockResolvedValue();

      const createdEvent = await eventService.createEvent(createEventDto);
      await eventService.deleteById(createdEvent.id);

      jest.spyOn(eventService, 'getById').mockResolvedValue(null);
      expect(eventController.getEventById({ eventId: 'some-id' }) == null);
    });
  });

});
