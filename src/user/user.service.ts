import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from './user.entity';
import { Event } from '../event/event.entity';
import { CreateUserDto } from './create-user.dto';
import { EventStatus } from '../event/event-status.enum';

@Injectable()
export class UserService {
	constructor(
		@InjectRepository(User)
		private userRepository: Repository<User>,
		@InjectRepository(Event)
		private eventRepository: Repository<Event>,
	) { }


	async getUsers(): Promise<User[]> {
		return this.userRepository.find();
	}

	async createUser(createUserDto: CreateUserDto): Promise<User> {
		const newUser = this.userRepository.create(createUserDto);
		return this.userRepository.save(newUser);
	}

	async mergeAll(userName: string): Promise<void> {
		const user = await this.userRepository.findOne({ where: { name: userName } });
		if (!user) {
			throw new NotFoundException('User not found');
		}

		const mergedEvents: Event[] = [];
		const events = await this.eventRepository.find({
			where: { title: In(user.events) },
			relations: ['invitees'],
		});
		events.sort((a, b) => {
			const startA = new Date(a.startTime);
			const startB = new Date(b.startTime);
			if (startA < startB) return -1;
			else if (startA > startB) return 1;
			else return 0;
		});

		let curGroup: Event[] = [];
		let prevEvent: Event | null = null;
		const isOverlapping = (event1: Event, event2: Event): boolean => {
			return (
				event1.startTime <= event2.endTime && event2.startTime <= event1.endTime
			);
		}

		for (const event of events) {
			if (prevEvent && !isOverlapping(prevEvent, event)) { // start new group
				if (curGroup.length > 1) {
					const merged = this.createMergedEvent(curGroup);
					mergedEvents.push(merged);
				} else {
					mergedEvents.push(...curGroup);
				}

				curGroup = [event];
			} else {
				curGroup.push(event);
			}
			prevEvent = event;
		}

		if (curGroup.length > 1) { // process last group
			const merged = this.createMergedEvent(curGroup);
			mergedEvents.push(merged);
		} else {
			mergedEvents.push(...curGroup);
		}

		user.events = mergedEvents.map((event) => event.title);
		await this.userRepository.save(user);
	}

	private createMergedEvent(events: Event[]): Event {
		const merged = new Event();

		// initialize as first event, then append others onto it
		merged.title = events[0].title;
		merged.description = events[0].description;
		merged.startTime = events[0].startTime;
		merged.endTime = events[0].endTime;
		merged.status = events[0].status;
		const new_invitees: Set<User> = new Set();
		events[0].invitees.forEach(invitee => new_invitees.add(invitee));

		for (let i = 1; i < events.length; i++) {
			const currentEvent = events[i];
			merged.title += `_${currentEvent.title}`;
			merged.description += `_${currentEvent.description}`;
			merged.endTime = currentEvent.endTime;

			// combine invitees from old events
			currentEvent.invitees.forEach(invitee => {
				const existingUser = Array.from(new_invitees).find(u => u.name === invitee.name);
				if (!existingUser) {
					new_invitees.add(invitee);
				}
			});
		}
		merged.invitees = Array.from(new_invitees);
		const allComplete = events.every((event) => event.status === EventStatus.COMPLETED);
		const allInProgress = events.every((event) => event.status === EventStatus.IN_PROGRESS);
		merged.status = allComplete
			? EventStatus.COMPLETED
			: allInProgress
				? EventStatus.IN_PROGRESS
				: EventStatus.TODO;

		this.updateInviteesEvents(events, merged);
		return merged;
	}

	private async updateInviteesEvents(oldEvents: Event[], newEvent: Event): Promise<void> {
		/**
		 * remove all old events from corresponding invitees
		 * push new event for these invitees
		 * delete old events from repository, save merged version
		 */
		const usersToUpdate: Set<User> = new Set();
		for (const oldEvent of oldEvents) {
			for (const invitee of oldEvent.invitees) {
				usersToUpdate.add(invitee);
			}
			await this.eventRepository.delete(oldEvent.id);
		}

		for (const user of usersToUpdate) {
			user.events = user.events.filter((e) =>
				!oldEvents.some((oldEvent) => oldEvent.title === e));
			user.events.push(newEvent.title);
			await this.userRepository.save(user);
		}

		await this.eventRepository.save(newEvent);
	}
}