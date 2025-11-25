import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  Patch,
  Delete,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { QuotesService } from './quotes.service';
import { Quote } from './quotes.entity';
import { DeleteResult } from 'typeorm';
import { Public } from '../auth/decorators/public.decorator';
import { CreateQuoteDto } from './dto/create-quote.dto';
import { UpdateQuoteDto } from './dto/update-quote.dto';

@ApiTags('quotes')
@Controller('quotes')
export class QuotesController {
  constructor(private readonly quoteService: QuotesService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Get all quotes (public)' })
  @ApiResponse({
    status: 200,
    description: 'List of all quotes',
    type: [Quote],
  })
  getAllQuotes(): Promise<Quote[]> {
    return this.quoteService.getAllQuotes();
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get a quote by ID (public)' })
  @ApiParam({ name: 'id', description: 'Quote ID' })
  @ApiResponse({
    status: 200,
    description: 'Quote found',
    type: Quote,
  })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  getQuote(@Param('id') id: number): Promise<Quote> {
    return this.quoteService.getQuoteById(id);
  }

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new quote (requires authentication)' })
  @ApiResponse({
    status: 201,
    description: 'Quote successfully created',
    type: Quote,
  })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  createQuote(@Body() createQuoteDto: CreateQuoteDto): Promise<Quote> {
    return this.quoteService.createQuote(
      createQuoteDto.author,
      createQuoteDto.quote,
    );
  }

  @Patch()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a quote (requires authentication)' })
  @ApiResponse({
    status: 200,
    description: 'Quote successfully updated',
    type: Quote,
  })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  updateQuote(@Body() updateQuoteDto: UpdateQuoteDto): Promise<Quote> {
    return this.quoteService.updateQuote(updateQuoteDto);
  }

  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a quote (requires authentication)' })
  @ApiParam({ name: 'id', description: 'Quote ID' })
  @ApiResponse({ status: 200, description: 'Quote successfully deleted' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  deleteQuote(@Param('id') id: number): Promise<DeleteResult> {
    return this.quoteService.deleteQuote(id);
  }
}
