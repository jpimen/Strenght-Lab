import type {
  AuthSession,
  IAuthRepository,
  LogInInput,
  PasswordResetChallenge,
  ResetPasswordInput,
  SignUpInput,
} from '../../domain/entities/AuthData';

type ApiErrorBody = {
  code?: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';
const TOKEN_KEY = 'ironlog.auth.token';

function getStoredToken() {
  const sessionToken = sessionStorage.getItem(TOKEN_KEY);
  if (sessionToken) return { token: sessionToken, rememberMe: false };

  const localToken = localStorage.getItem(TOKEN_KEY);
  if (localToken) return { token: localToken, rememberMe: true };

  return null;
}

function persistToken(token: string, rememberMe: boolean) {
  if (rememberMe) {
    localStorage.setItem(TOKEN_KEY, token);
    sessionStorage.removeItem(TOKEN_KEY);
  } else {
    sessionStorage.setItem(TOKEN_KEY, token);
    localStorage.removeItem(TOKEN_KEY);
  }
}

function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
}

function toErrorCode(fallback: string, body: unknown) {
  const typed = body as ApiErrorBody | null;
  return typed?.code ?? fallback;
}

async function readJson<T>(response: Response): Promise<T | null> {
  const contentType = response.headers.get('content-type') ?? '';
  if (!contentType.includes('application/json')) return null;
  try {
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  token?: string
): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has('Content-Type') && init.body) {
    headers.set('Content-Type', 'application/json');
  }
  if (token) headers.set('Authorization', `Bearer ${token}`);

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers,
    });
  } catch {
    throw new Error('AUTH_NETWORK_ERROR');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const body = await readJson<unknown>(response);
  if (!response.ok) {
    throw new Error(toErrorCode('AUTH_SERVER_ERROR', body));
  }

  return body as T;
}

export class ApiAuthRepository implements IAuthRepository {
  async signUp(input: SignUpInput): Promise<AuthSession> {
    const rememberMe = input.rememberMe ?? true;
    const session = await request<AuthSession>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({
        fullName: input.fullName,
        email: input.email,
        password: input.password,
      }),
    });
    persistToken(session.token, rememberMe);
    return session;
  }

  async logIn(input: LogInInput): Promise<AuthSession> {
    const session = await request<AuthSession>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({
        email: input.email,
        password: input.password,
      }),
    });
    persistToken(session.token, input.rememberMe);
    return session;
  }

  async logOut(): Promise<void> {
    const current = getStoredToken();
    if (current) {
      try {
        await request<void>('/auth/logout', { method: 'POST' }, current.token);
      } catch {
        // Local token is always cleared, even if backend is unavailable.
      }
    }
    clearToken();
  }

  async getSession(): Promise<AuthSession | null> {
    const current = getStoredToken();
    if (!current) return null;

    try {
      const session = await request<AuthSession>('/auth/session', { method: 'GET' }, current.token);
      return session;
    } catch (err) {
      const code = err instanceof Error ? err.message : '';
      if (code === 'AUTH_INVALID_SESSION' || code === 'AUTH_UNAUTHORIZED') {
        clearToken();
        return null;
      }
      throw err;
    }
  }

  async requestPasswordReset(email: string): Promise<PasswordResetChallenge> {
    return request<PasswordResetChallenge>('/auth/password-reset/request', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    await request<void>('/auth/password-reset/confirm', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    clearToken();
  }
}

export const authRepository = new ApiAuthRepository();
