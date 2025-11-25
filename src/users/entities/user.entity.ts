import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

@Entity()
export class User {
  @ApiProperty({
    description: 'Unique identifier of the user (UUID)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Username for the user account',
    example: 'john_doe',
  })
  @Column({ unique: true })
  userName: string;

  @ApiProperty({
    description: 'Hashed password for the user account',
    example: '$2b$10$...',
  })
  @Column({ nullable: false })
  password: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
    required: false,
  })
  @Column({ nullable: true })
  fName: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
    required: false,
  })
  @Column({ nullable: true })
  lName: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'john.doe@example.com',
  })
  @Column({ unique: true })
  email: string;

  @ApiProperty({
    description: 'Timestamp when the user was created',
    example: '2025-01-15T10:30:00Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Timestamp when the user was last updated',
    example: '2025-01-15T10:30:00Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;
}
