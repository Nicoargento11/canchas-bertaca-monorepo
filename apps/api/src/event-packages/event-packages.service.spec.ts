import { Test, TestingModule } from '@nestjs/testing';
import { EventPackagesService } from './event-packages.service';

describe('EventPackagesService', () => {
    let service: EventPackagesService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [EventPackagesService],
        }).compile();

        service = module.get<EventPackagesService>(EventPackagesService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });
});
