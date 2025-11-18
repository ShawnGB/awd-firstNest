import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Quote } from './quotes.entity';
import { DeleteResult, Repository } from 'typeorm';

@Injectable()
export class QuotesService {
  constructor(
    @InjectRepository(Quote) private quoteRepository: Repository<Quote>,
  ) {}

  async getAllQuotes(): Promise<Quote[]> {
    return this.quoteRepository.find();
  }

  async getQuoteById(id: number): Promise<Quote> {
    const quote = await this.quoteRepository.findOne({ where: { id } });
    if (!quote) throw new NotFoundException(`Quote with ${id} not found`);
    return quote;
  }

  async createQuote(author: string, quote: string): Promise<Quote> {
    const newQuote = await this.quoteRepository.save({ author, quote });
    if (!newQuote) throw new Error(`Creation did not work`);

    return newQuote;
  }

  async updateQuote(body: Partial<Quote>): Promise<Quote> {
    if (!body.id) throw new Error(`Missing id, update not possible`);
    const update = await this.quoteRepository.update(body.id, body);

    if (!update) throw new Error(`Something went wrong`);
    return this.getQuoteById(body.id);
  }

  async deleteQuote(id: number): Promise<DeleteResult> {
    return this.quoteRepository.delete(id);
  }
}
