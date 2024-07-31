import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.register')
  registerUser(@Payload() registerDto: RegisterDto) {
    return this.authService.registerUser(registerDto);
  }

  @MessagePattern('auth.login')
  loginUser(@Payload() loginDto: LoginDto) {
    return this.authService.loginUser(loginDto);
  }

  @MessagePattern('auth.verify')
  verifyToken(@Payload('token') token: string) {
    return this.authService.verifyToken(token);
  }
}
