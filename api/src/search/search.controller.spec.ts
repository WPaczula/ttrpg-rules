import { Test } from '@nestjs/testing';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { ClerkAuthGuard } from '../auth/guards/clerk-auth.guard';

describe('SearchController', () => {
  let controller: SearchController;
  let service: { search: jest.Mock };

  beforeEach(async () => {
    service = {
      search: jest.fn().mockResolvedValue([
        'Hope is a resource...',
        'Stress represents...',
      ]),
    };

    const module = await Test.createTestingModule({
      controllers: [SearchController],
      providers: [{ provide: SearchService, useValue: service }],
    })
      .overrideGuard(ClerkAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get(SearchController);
  });

  describe('search', () => {
    it('delegates to SearchService and returns string array', async () => {
      const result = await controller.search({
        query: 'how does hope work?',
        limit: 5,
      });

      expect(service.search).toHaveBeenCalledWith('how does hope work?', 5, undefined);
      expect(result).toEqual(['Hope is a resource...', 'Stress represents...']);
    });

    it('uses default limit of 5 when not provided', async () => {
      await controller.search({ query: 'healing' });

      expect(service.search).toHaveBeenCalledWith('healing', 5, undefined);
    });

    it('passes category when provided', async () => {
      await controller.search({ query: 'attack', limit: 3, category: 'classes' });

      expect(service.search).toHaveBeenCalledWith('attack', 3, 'classes');
    });
  });
});
