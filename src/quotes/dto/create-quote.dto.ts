import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuoteDto {
  @ApiProperty({
    description: 'Author of the quote',
    example: 'Albert Einstein',
  })
  @IsNotEmpty()
  @IsString()
  author: string;

  @ApiProperty({
    description: 'The quote text',
    example: 'Imagination is more important than knowledge.',
  })
  @IsNotEmpty()
  @IsString()
  quote: string;
}
