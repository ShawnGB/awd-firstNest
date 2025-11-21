import {
  Column,
  PrimaryGeneratedColumn,
  Entity,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  userName: string;

  @Column({ nullable: false })
  password: string;

  @Column({ nullable: true })
  fName: string;

  @Column({ nullable: true })
  lName: string;

  @Column({ unique: true })
  email: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
