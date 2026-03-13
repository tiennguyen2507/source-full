import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth() {
    return { ok: true };
  }

  @Get('todos')
  getTodos(): Todo[] {
    return [
      { id: 1, title: 'Học NestJS cơ bản', completed: true },
      { id: 2, title: 'Viết API todo demo', completed: true },
      { id: 3, title: 'Kết nối Next.js frontend', completed: false },
      { id: 4, title: 'Triển khai qua Docker Compose', completed: false },
    ];
  }
}
