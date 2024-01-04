import { Controller, Get, Param } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('increment/:a')
  incrementNumber(@Param('a') a: number): number {
    return this.appService.incrementNumber(a);
  }

  @Get('sum/:a/:b')
  addNumbers(@Param('a') a: string, @Param('b') b: string): number {
    return this.appService.addNumbers(a, b);
  }
}
