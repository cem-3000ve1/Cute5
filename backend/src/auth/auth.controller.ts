import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ValidationPipe,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import { AuthService } from "./auth.service";
import { AuthResponse } from "./auth.config";
import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsIn,
} from "class-validator";
import { UserStatus, USER_STATUS_VALUES } from "../types/user-status.type";

class SignUpDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  username?: string;
}

class SignInDto {
  @IsEmail()
  email: string;

  @IsString()
  password: string;
}

class UpdateStatusDto {
  @IsString()
  @IsIn(USER_STATUS_VALUES)
  status: UserStatus;
}

@Controller("api/auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("signup")
  @HttpCode(HttpStatus.CREATED)
  async signUp(
    @Body(ValidationPipe) signUpDto: SignUpDto
  ): Promise<AuthResponse> {
    return this.authService.signUp(
      signUpDto.email,
      signUpDto.password,
      signUpDto.username
    );
  }

  @Post("signin")
  @HttpCode(HttpStatus.OK)
  async signIn(
    @Body(ValidationPipe) signInDto: SignInDto
  ): Promise<AuthResponse> {
    return this.authService.signIn(signInDto.email, signInDto.password);
  }

  @Post("anonymous")
  @HttpCode(HttpStatus.OK)
  async signInAnonymous(): Promise<AuthResponse> {
    return this.authService.signInAnonymous();
  }

  @Get("me")
  @UseGuards(AuthGuard("jwt"))
  async getProfile(@Request() req: any) {
    console.log("Auth request user:", req.user);
    return req.user;
  }

  @Get("users")
  @UseGuards(AuthGuard("jwt"))
  async getAllUsers() {
    return this.authService.getAllUsers();
  }

  @Patch("status")
  @UseGuards(AuthGuard("jwt"))
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @Request() req: any,
    @Body(ValidationPipe) updateStatusDto: UpdateStatusDto
  ) {
    return this.authService.updateUserStatus(
      req.user.id,
      updateStatusDto.status
    );
  }
}
