import { jest } from '@jest/globals';
import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';

describe('EventsController', () => {
    let controller: EventsController;
    const eventsService = {
        createForMusicLink: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [EventsController],
            providers: [
                {
                    provide: EventsService,
                    useValue: eventsService,
                },
            ],
        }).compile();

        controller = module.get<EventsController>(EventsController);
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    it('should delegate event creation to the service', async () => {
        const dto = {
            eventType: 'platform_click' as const,
            platform: 'spotify',
        };
        const response = {
            eventType: dto.eventType,
            platform: dto.platform,
            metadata: null,
            createdAt: '2026-05-24T08:00:00.000Z',
        };

        eventsService.createForMusicLink.mockResolvedValue(response);

        await expect(controller.create('public-id', dto)).resolves.toEqual(
            response,
        );
        expect(eventsService.createForMusicLink).toHaveBeenCalledWith(
            'public-id',
            dto,
        );
    });
});
