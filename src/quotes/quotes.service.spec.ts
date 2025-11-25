import { QuotesService } from './quotes.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Quote } from './quotes.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

describe('QuotesService', () => {
  let service: QuotesService;
  let repository: Repository<Quote>;

  const mockQuoteRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuotesService,
        {
          provide: getRepositoryToken(Quote),
          useValue: mockQuoteRepository,
        },
      ],
    }).compile();

    service = module.get<QuotesService>(QuotesService);
    repository = module.get<Repository<Quote>>(getRepositoryToken(Quote));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllQuotes', () => {
    it('should return all quotes', async () => {
      const mockQuotes: Quote[] = [
        {
          id: 1,
          author: 'Albert Einstein',
          quote: 'Life is like riding a bicycle.',
        },
        {
          id: 2,
          author: 'Mark Twain',
          quote: 'The secret of getting ahead is getting started.',
        },
      ];

      mockQuoteRepository.find.mockResolvedValue(mockQuotes);

      const result = await service.getAllQuotes();

      expect(result).toEqual(mockQuotes);
      expect(mockQuoteRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('getQuoteById', () => {
    it('should return a quote by id', async () => {
      const mockQuote: Quote = {
        id: 1,
        author: 'Albert Einstein',
        quote: 'Life is like riding a bicycle.',
      };

      mockQuoteRepository.findOne.mockResolvedValue(mockQuote);

      const result = await service.getQuoteById(1);

      expect(result).toEqual(mockQuote);
      expect(mockQuoteRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw NotFoundException when quote is not found', async () => {
      mockQuoteRepository.findOne.mockResolvedValue(null);

      await expect(service.getQuoteById(999)).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getQuoteById(999)).rejects.toThrow(
        'Quote with 999 not found',
      );
    });
  });

  describe('createQuote', () => {
    it('should create a new quote', async () => {
      const mockQuote: Quote = {
        id: 1,
        author: 'Test Author',
        quote: 'Test quote',
      };

      mockQuoteRepository.save.mockResolvedValue(mockQuote);

      const result = await service.createQuote('Test Author', 'Test quote');

      expect(result).toEqual(mockQuote);
      expect(mockQuoteRepository.save).toHaveBeenCalledWith({
        author: 'Test Author',
        quote: 'Test quote',
      });
    });

    it('should throw error when creation fails', async () => {
      mockQuoteRepository.save.mockResolvedValue(null);

      await expect(service.createQuote('Author', 'Quote')).rejects.toThrow(
        'Creation did not work',
      );
    });
  });

  describe('updateQuote', () => {
    it('should update a quote', async () => {
      const updateBody: Partial<Quote> = {
        id: 1,
        author: 'Updated Author',
        quote: 'Updated quote',
      };

      const updatedQuote: Quote = {
        id: 1,
        author: 'Updated Author',
        quote: 'Updated quote',
      };

      mockQuoteRepository.update.mockResolvedValue({ affected: 1 });
      mockQuoteRepository.findOne.mockResolvedValue(updatedQuote);

      const result = await service.updateQuote(updateBody);

      expect(result).toEqual(updatedQuote);
      expect(mockQuoteRepository.update).toHaveBeenCalledWith(1, updateBody);
    });

    it('should throw error when id is missing', async () => {
      const updateBody: Partial<Quote> = {
        author: 'Updated Author',
      };

      await expect(service.updateQuote(updateBody)).rejects.toThrow(
        'Missing id, update not possible',
      );
    });
  });

  describe('deleteQuote', () => {
    it('should delete a quote', async () => {
      const mockDeleteResult = { affected: 1, raw: {} };

      mockQuoteRepository.delete.mockResolvedValue(mockDeleteResult);

      const result = await service.deleteQuote(1);

      expect(result).toEqual(mockDeleteResult);
      expect(mockQuoteRepository.delete).toHaveBeenCalledWith(1);
    });
  });
});
