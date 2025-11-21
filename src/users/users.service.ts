import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { QueryUserDto } from './dto/query-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const newUser = await this.userRepository.save({
      ...createUserDto,
      password: hashedPassword,
    });

    const { password: _, ...safeUser } = newUser;
    return safeUser;
  }

  async findAll(queryUserDto: QueryUserDto) {
    const { filter } = queryUserDto;

    return await this.userRepository.find(
      filter ? { where: { userName: `%${filter}%` } } : {},
    );
  }

  async findOne(id: string) {
    return await this.userRepository.findOneBy({ id });
  }

  async findByUsername(userName: string) {
    return await this.userRepository.findOneBy({ userName });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    await this.userRepository.update(id, updateUserDto);
    return await this.findOne(id);
  }

  async remove(id: string) {
    const user = await this.findOne(id);
    if (!user) {
      return null;
    }
    await this.userRepository.remove(user);
    return user;
  }
}
