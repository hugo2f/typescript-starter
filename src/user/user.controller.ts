import { Controller, Get, Post, Body } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './create-user.dto';
import { User } from './user.entity';

@Controller('users')
export class UserController {
	constructor(private readonly userService: UserService) { }

	@Get()
	async getEvents() {
		return this.userService.getUsers();
	}

	@Post()
	async createUser(@Body() createUserDto: CreateUserDto): Promise<User> {
		return this.userService.createUser(createUserDto);
	}

	@Post('mergeAll')
	async mergeAll(@Body('userName') userName: string): Promise<void> {
		await this.userService.mergeAll(userName);
	}
}