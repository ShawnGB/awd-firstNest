import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class Quote {
  @ApiProperty({
    description: 'Unique identifier of the quote',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'The quote text',
    example: 'Imagination is more important than knowledge.',
  })
  @Column()
  quote: string;

  @ApiProperty({
    description: 'Author of the quote',
    example: 'Albert Einstein',
  })
  @Column()
  author: string;
}
