import { createContext } from 'react';
import type { AuthUser, PasswordResetChallenge, ResetPasswordInput, SignUpInput } from '../../domain/entities/AuthData';

export type LogInArgs = {
  email: string;
  password: string;
  rememberMe: boolean;
};

export type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  signUp: (input: SignUpInput) => Promise<void>;
  logIn: (args: LogInArgs) => Promise<void>;
  logOut: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<PasswordResetChallenge>;
  resetPassword: (input: ResetPasswordInput) => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

