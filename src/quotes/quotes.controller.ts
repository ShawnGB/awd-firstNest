import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Patch,
  Delete,
} from '@nestjs/common';
import { QuotesService } from './quotes.service';
import { Quote } from './quotes.entity';
import { DeleteResult } from 'typeorm';
import { Public } from '../auth/decorators/public.decorator';

@Controller('quotes')
export class QuotesController {
  constructor(private readonly quoteService: QuotesService) {}

  @Public()
  @Get()
  getAllQuotes(): Promise<Quote[]> {
    return this.quoteService.getAllQuotes();
  }

  @Public()
  @Get(':id')
  getQuote(@Param('id') id: number): Promise<Quote> {
    return this.quoteService.getQuoteById(id);
  }

  @Post()
  createQuote(@Body() body: { author: string; quote: string }): Promise<Quote> {
    return this.quoteService.createQuote(body.author, body.quote);
  }

  @Patch()
  updateQuote(@Body() body: Partial<Quote>): Promise<Quote> {
    return this.quoteService.updateQuote(body);
  }

  @Delete(':id')
  deleteQuote(@Param('id') id: number): Promise<DeleteResult> {
    return this.quoteService.deleteQuote(id);
  }
}
