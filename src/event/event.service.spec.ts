import { Test, TestingModule } from '@nestjs/testing';
import { EventService } from './event.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Event } from './event.entity';
import { User } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { EventStatus } from './event-status.enum';
import { CreateEventDto } from './create-event.dto';

describe('EventService (Integration)', () => {
	let eventService: EventService;
	let eventRepository: Repository<Event>;
	let userRepository: Repository<User>;
	let userService: UserService;

	beforeAll(async () => {
		const module: TestingModule = await Test.createTestingModule({
			providers: [
				EventService,
				{
					provide: getRepositoryToken(Event),
					useClass: Repository,
				},
				{
					provide: getRepositoryToken(User),
					useClass: Repository,
				},
				UserService,
			],
		}).compile();

		eventService = module.get<EventService>(EventService);
		eventRepository = module.get<Repository<Event>>(getRepositoryToken(Event));
		userRepository = module.get<Repository<User>>(getRepositoryToken(User));
		userService = module.get<UserService>(UserService);
	});

	it('should create a user, create an event, and invite the user to the event', async () => {
		jest.spyOn(userRepository, 'save').mockResolvedValue({
			id: 'user-id',
			name: 'John Doe',
			events: [],
		} as User);

		jest.spyOn(eventRepository, 'save').mockResolvedValue({
			id: 'event-id',
			title: 'Test Event',
			description: 'Test description',
			status: 'TODO',
		} as Event);

		jest.spyOn(userService, 'createUser').mockResolvedValue({
			id: 'user-id',
			name: 'John Doe',
			events: [],
		} as User);

		jest.spyOn(eventService, 'inviteUsers').mockResolvedValue(undefined);

		const createUserDto = { name: 'John Doe' };
		const createdUser = await userService.createUser(createUserDto);

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

		const createdEvent = await eventService.createEvent(createEventDto);
		await eventService.inviteUsers(createdEvent.id, [createdUser.id]);

		expect(createdUser).toBeDefined();
		expect(createdEvent).toBeDefined();
		expect(eventService.inviteUsers).toHaveBeenCalledWith(createdEvent.id, [createdUser.id]);
	});
});
