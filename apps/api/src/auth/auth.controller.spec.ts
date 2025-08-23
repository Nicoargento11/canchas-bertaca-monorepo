import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { LoginDto } from './dto/login.dto';
import { Response } from 'express';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  // Mocks
  const mockAuthService = {
    login: jest.fn().mockResolvedValue({
      access_token: 'mockAccessToken',
      refresh_token: 'mockRefreshToken',
      user: { id: '1', email: 'test@example.com' },
    }),
  };

  const mockResponse = {
    cookie: jest.fn(),
    clearCookie: jest.fn(),
  } as unknown as Response;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: {} },
        { provide: JwtService, useValue: {} },
        { provide: ConfigService, useValue: {} },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('debería estar definido', () => {
    expect(controller).toBeDefined();
  });

  describe('login', () => {
    it('debería llamar a authService.login y setear cookies', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const result = await controller.login(loginDto, mockResponse);

      expect(authService.login).toHaveBeenCalledWith(loginDto);
      expect(mockResponse.cookie).toHaveBeenCalledTimes(2);
      expect(result.access_token).toBe('mockAccessToken');
    });
  });
});
