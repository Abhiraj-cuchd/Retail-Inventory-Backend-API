import { Body, Controller, Post, Route, Tags, Response } from "tsoa"
import { AuthService, type LoginCredentials } from "../application/services/auth.service"
import { UserRepository } from "../infrastructure/repositories/user.repository"
import { type IUser, User, UserRole } from "../domain/models/user.model"
import { EmailService } from "../application/services/email.service"

interface RegisterRequest {
  email: string
  password: string
  firstName: string
  lastName: string
  role?: UserRole
}

interface LoginRequest {
  email: string
  password: string
}

interface AuthResponse {
  user: IUser
  token: string
}

@Route("auth")
@Tags("Authentication")
export class AuthController extends Controller {
  private authService: AuthService
  private emailService: EmailService

  constructor() {
    super()
    const userRepository = new UserRepository()
    this.authService = new AuthService(userRepository)
    this.emailService = new EmailService()
  }

  /**
   * Register a new user
   */
  @Post('register')
  @Response<string>(400, 'Bad Request')
  @Response<string>(409, 'Email already exists')
  public async register(@Body() requestBody: RegisterRequest): Promise<IUser> {
    const user = new User({
      email: requestBody.email,
      password: requestBody.password,
      firstName: requestBody.firstName,
      lastName: requestBody.lastName,
      role: requestBody.role || UserRole.CUSTOMER,
      isActive: true,
    });

    const createdUser = await this.authService.register(user);

    // Send welcome email
    await this.emailService.sendWelcomeEmail(
      createdUser.email,
      `${createdUser.firstName} ${createdUser.lastName}`
    );

    return createdUser;
  }

  /**
   * Login with email and password
   */
  @Post('login')
  @Response(400, 'Bad Request')
  @Response(401, 'Invalid email or password')
  public async login(@Body() requestBody: LoginRequest): Promise<AuthResponse> {
    const credentials: LoginCredentials = {
      email: requestBody.email,
      password: requestBody.password,
    };

    return this.authService.login(credentials);
  }
}
