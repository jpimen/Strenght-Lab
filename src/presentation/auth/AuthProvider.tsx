import React, { useEffect, useMemo, useState } from 'react';
import type { AuthUser } from '../../domain/entities/AuthData';
import { authRepository } from '../../data/repositories/MockAuthRepository';
import { AuthContext } from './AuthContext';
import type { AuthContextValue } from './AuthContext';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const init = async () => {
      try {
        const session = await authRepository.getSession();
        if (active) setUser(session?.user ?? null);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void init();

    return () => {
      active = false;
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      user,
      isLoading,
      signUp: async (input) => {
        const session = await authRepository.signUp(input);
        setUser(session.user);
      },
      logIn: async (args) => {
        const session = await authRepository.logIn(args);
        setUser(session.user);
      },
      logOut: async () => {
        await authRepository.logOut();
        setUser(null);
      },
      requestPasswordReset: async (email) => authRepository.requestPasswordReset(email),
      resetPassword: async (input) => {
        await authRepository.resetPassword(input);
        setUser(null);
      },
    };
  }, [isLoading, user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
