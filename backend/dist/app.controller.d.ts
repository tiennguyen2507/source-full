import { AppService } from './app.service';
type Todo = {
    id: number;
    title: string;
    completed: boolean;
};
export declare class AppController {
    private readonly appService;
    constructor(appService: AppService);
    getHello(): string;
    getHealth(): {
        ok: boolean;
    };
    getTodos(): Todo[];
}
export {};
