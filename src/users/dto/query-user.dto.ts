import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryUserDto {
  @ApiPropertyOptional({
    description: 'Filter string to search users',
    example: 'john',
  })
  @IsOptional()
  @IsString()
  filter?: string;
}
