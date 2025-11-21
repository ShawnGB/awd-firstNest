import { Controller, Request, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { AuthLoginDto } from './dto/login-auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  login(@Request() req: AuthLoginDto) {
    return this.authService.login(req);
  }
}
