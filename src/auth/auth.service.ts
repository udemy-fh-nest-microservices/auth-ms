import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RpcException } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './types/jwt-payload.interface';
import * as bcrypt from 'bcrypt';
import { envs } from 'src/config';

@Injectable()
export class AuthService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(AuthService.name);

  onModuleInit() {
    this.$connect();
    this.logger.log('Connected to database');
  }

  constructor(private readonly jwtService: JwtService) {
    super();
  }

  async signPayload(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  async registerUser(registerDto: RegisterDto) {
    const { email, name, password } = registerDto;

    const foundUser = await this.user.findUnique({
      where: { email },
    });

    if (foundUser) {
      throw new RpcException({
        status: HttpStatus.CONFLICT,
        message: 'User already exists',
      });
    }

    try {
      const hashedPassword = bcrypt.hashSync(password, 10);

      const user = await this.user.create({
        data: {
          email,
          name,
          password: hashedPassword,
        },
        select: {
          id: true,
          name: true,
          email: true,
        },
      });

      const token = await this.signPayload(user);

      return { user, token };
    } catch (error) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: error.message,
      });
    }
  }

  async loginUser(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const foundUser = await this.user.findUnique({
      where: { email },
    });

    if (!foundUser) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Check your credentials',
      });
    }

    const isPasswordValid = bcrypt.compareSync(password, foundUser.password);

    if (!isPasswordValid) {
      throw new RpcException({
        status: HttpStatus.BAD_REQUEST,
        message: 'Check your credentials',
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: __, ...user } = foundUser;

    const token = await this.signPayload(user);

    return {
      user,
      token,
    };
  }

  async verifyToken(token: string) {
    console.log('🚀 ~ AuthService ~ verifyToken ~ token:', token);
    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { sub, iat, exp, ...user } = await this.jwtService.verify(token, {
        secret: envs.JWT_SECRET,
      });

      const newToken = await this.signPayload(user);

      return {
        user,
        token: newToken,
      };
    } catch (error) {
      console.log('🚀 ~ AuthService ~ verifyToken ~ error:', error);
      throw new RpcException({
        status: HttpStatus.UNAUTHORIZED,
        message: 'Unauthorized',
      });
    }
  }
}
