import { Controller } from '@nestjs/common';
import { AuthService } from './auth.service';
import { MessagePattern } from '@nestjs/microservices';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @MessagePattern('auth.register')
  registerUser() {
    return {
      message: 'Register User',
    };
  }

  @MessagePattern('auth.login')
  loginUser() {
    return {
      message: 'Login User',
    };
  }

  @MessagePattern('auth.verify')
  verifyToken() {
    return {
      message: 'Verify Tokencd ',
    };
  }
}
