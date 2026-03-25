export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
}

export interface AuthSession {
  token: string;
  user: AuthUser;
  createdAt: string;
  expiresAt: string;
}

export interface SignUpInput {
  fullName: string;
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LogInInput {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface PasswordResetChallenge {
  email: string;
  resetCode: string;
  expiresAt: string;
}

export interface ResetPasswordInput {
  email: string;
  resetCode: string;
  newPassword: string;
}

export interface IAuthRepository {
  signUp(input: SignUpInput): Promise<AuthSession>;
  logIn(input: LogInInput): Promise<AuthSession>;
  logOut(): Promise<void>;
  getSession(): Promise<AuthSession | null>;
  requestPasswordReset(email: string): Promise<PasswordResetChallenge>;
  resetPassword(input: ResetPasswordInput): Promise<void>;
}

