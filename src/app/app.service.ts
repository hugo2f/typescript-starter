import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  incrementNumber(a: number): number {
    return a + 1;
  }

  addNumbers(a: string, b: string): number {
    return parseInt(a, 10) + parseInt(b, 10);
  }
}
