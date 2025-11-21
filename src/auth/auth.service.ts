import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { SafeUserDto } from 'src/users/dto/safe-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    userName: string,
    pass: string,
  ): Promise<SafeUserDto | null> {
    const user = await this.userService.findByUsername(userName);
    if (!user) return null;

    const isValidPassword = await bcrypt.compare(pass, user.password);
    if (!isValidPassword) return null;

    const { password: _, ...safeUser } = user;
    return safeUser;
  }

  login(user: SafeUserDto) {
    const payload = { username: user.userName, sub: user.id };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
