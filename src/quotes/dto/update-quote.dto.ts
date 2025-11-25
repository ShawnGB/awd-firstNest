import { PartialType } from '@nestjs/swagger';
import { CreateQuoteDto } from './create-quote.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class UpdateQuoteDto extends PartialType(CreateQuoteDto) {
  @ApiProperty({
    description: 'ID of the quote to update',
    example: 1,
  })
  @IsNumber()
  id: number;
}
