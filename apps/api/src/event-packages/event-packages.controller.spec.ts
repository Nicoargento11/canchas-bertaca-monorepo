import { Test, TestingModule } from '@nestjs/testing';
import { EventPackagesController } from './event-packages.controller';

describe('EventPackagesController', () => {
  let controller: EventPackagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventPackagesController],
    }).compile();

    controller = module.get<EventPackagesController>(EventPackagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
