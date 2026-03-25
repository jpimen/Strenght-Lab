import type {
  AuthSession,
  AuthUser,
  IAuthRepository,
  LogInInput,
  PasswordResetChallenge,
  ResetPasswordInput,
  SignUpInput,
} from '../../domain/entities/AuthData';

type StoredUser = {
  id: string;
  fullName: string;
  email: string;
  passwordHash: string;
  passwordSalt: string;
  createdAt: string;
};

type StoredSession = {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
};

type StoredPasswordReset = {
  email: string;
  codeHash: string;
  codeSalt: string;
  createdAt: string;
  expiresAt: string;
};

const USERS_KEY = 'ironlog.auth.users';
const SESSION_KEY = 'ironlog.auth.session';
const PASSWORD_RESET_KEY = 'ironlog.auth.password_reset';

const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7; // 7 days
const PASSWORD_RESET_TTL_MS = 1000 * 60 * 15; // 15 minutes

function nowIso() {
  return new Date().toISOString();
}

function isExpired(expiresAtIso: string) {
  return Date.now() > Date.parse(expiresAtIso);
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string) {
  // Basic validation: good enough for client-side.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function base64FromBytes(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function bytesFromBase64(base64: string) {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function sha256Base64(text: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return base64FromBytes(new Uint8Array(digest));
}

function randomBase64(bytesLength: number) {
  const bytes = new Uint8Array(bytesLength);
  crypto.getRandomValues(bytes);
  return base64FromBytes(bytes);
}

function getStorageSessionRaw() {
  const sessionRaw = sessionStorage.getItem(SESSION_KEY);
  if (sessionRaw) return { sessionRaw, rememberMe: false };
  const localRaw = localStorage.getItem(SESSION_KEY);
  if (localRaw) return { sessionRaw: localRaw, rememberMe: true };
  return null;
}

function readUsers(): StoredUser[] {
  const raw = localStorage.getItem(USERS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as StoredUser[];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function readPasswordResets(): StoredPasswordReset[] {
  const raw = localStorage.getItem(PASSWORD_RESET_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed as StoredPasswordReset[];
  } catch {
    return [];
  }
}

function writePasswordResets(resets: StoredPasswordReset[]) {
  localStorage.setItem(PASSWORD_RESET_KEY, JSON.stringify(resets));
}

function clearSession() {
  sessionStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(SESSION_KEY);
}

function toAuthUser(stored: StoredUser): AuthUser {
  return {
    id: stored.id,
    fullName: stored.fullName,
    email: stored.email,
    createdAt: stored.createdAt,
  };
}

function persistSession(session: StoredSession, rememberMe: boolean) {
  const raw = JSON.stringify(session);
  if (rememberMe) {
    localStorage.setItem(SESSION_KEY, raw);
    sessionStorage.removeItem(SESSION_KEY);
  } else {
    sessionStorage.setItem(SESSION_KEY, raw);
    localStorage.removeItem(SESSION_KEY);
  }
}

function randomSixDigitCode() {
  const value = crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000;
  return value.toString().padStart(6, '0');
}

export class MockAuthRepository implements IAuthRepository {
  async signUp(input: SignUpInput): Promise<AuthSession> {
    const fullName = input.fullName.trim();
    const email = normalizeEmail(input.email);
    const password = input.password;
    const rememberMe = input.rememberMe ?? true;

    if (!fullName) throw new Error('AUTH_FULL_NAME_REQUIRED');
    if (!email) throw new Error('AUTH_EMAIL_REQUIRED');
    if (!isValidEmail(email)) throw new Error('AUTH_EMAIL_INVALID');
    if (!password) throw new Error('AUTH_PASSWORD_REQUIRED');
    if (password.length < 8) throw new Error('AUTH_PASSWORD_TOO_SHORT');

    const users = readUsers();
    const existing = users.find((u) => u.email === email);
    if (existing) throw new Error('AUTH_EMAIL_IN_USE');

    const passwordSalt = randomBase64(16);
    const passwordHash = await sha256Base64(`${passwordSalt}:${password}`);
    const createdAt = nowIso();
    const user: StoredUser = {
      id: crypto.randomUUID(),
      fullName,
      email,
      passwordSalt,
      passwordHash,
      createdAt,
    };

    users.push(user);
    writeUsers(users);

    const sessionCreatedAt = nowIso();
    const session: StoredSession = {
      token: crypto.randomUUID(),
      userId: user.id,
      createdAt: sessionCreatedAt,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
    };
    persistSession(session, rememberMe);

    return {
      token: session.token,
      user: toAuthUser(user),
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    };
  }

  async logIn(input: LogInInput): Promise<AuthSession> {
    const email = normalizeEmail(input.email);
    const password = input.password;
    const rememberMe = input.rememberMe;

    if (!email) throw new Error('AUTH_EMAIL_REQUIRED');
    if (!isValidEmail(email)) throw new Error('AUTH_EMAIL_INVALID');
    if (!password) throw new Error('AUTH_PASSWORD_REQUIRED');

    const users = readUsers();
    const user = users.find((u) => u.email === email);
    if (!user) throw new Error('AUTH_INVALID_CREDENTIALS');

    const passwordHash = await sha256Base64(`${user.passwordSalt}:${password}`);
    if (passwordHash !== user.passwordHash) throw new Error('AUTH_INVALID_CREDENTIALS');

    const session: StoredSession = {
      token: crypto.randomUUID(),
      userId: user.id,
      createdAt: nowIso(),
      expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
    };
    persistSession(session, rememberMe);

    return {
      token: session.token,
      user: toAuthUser(user),
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    };
  }

  async logOut(): Promise<void> {
    clearSession();
  }

  async getSession(): Promise<AuthSession | null> {
    const stored = getStorageSessionRaw();
    if (!stored) return null;

    let session: StoredSession;
    try {
      session = JSON.parse(stored.sessionRaw) as StoredSession;
    } catch {
      clearSession();
      return null;
    }

    if (!session?.userId || !session?.expiresAt || isExpired(session.expiresAt)) {
      clearSession();
      return null;
    }

    const users = readUsers();
    const user = users.find((u) => u.id === session.userId);
    if (!user) {
      clearSession();
      return null;
    }

    return {
      token: session.token,
      user: toAuthUser(user),
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
    };
  }

  async requestPasswordReset(emailInput: string): Promise<PasswordResetChallenge> {
    const email = normalizeEmail(emailInput);
    if (!email) throw new Error('AUTH_EMAIL_REQUIRED');
    if (!isValidEmail(email)) throw new Error('AUTH_EMAIL_INVALID');

    const users = readUsers();
    const user = users.find((u) => u.email === email);
    if (!user) throw new Error('AUTH_USER_NOT_FOUND');

    const resetCode = randomSixDigitCode();
    const codeSalt = randomBase64(16);
    const codeHash = await sha256Base64(`${codeSalt}:${resetCode}`);
    const createdAt = nowIso();
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS).toISOString();

    const resets = readPasswordResets().filter((r) => r.email !== email);
    resets.push({
      email,
      codeSalt,
      codeHash,
      createdAt,
      expiresAt,
    });
    writePasswordResets(resets);

    return { email, resetCode, expiresAt };
  }

  async resetPassword(input: ResetPasswordInput): Promise<void> {
    const email = normalizeEmail(input.email);
    const resetCode = input.resetCode.trim();
    const newPassword = input.newPassword;

    if (!email) throw new Error('AUTH_EMAIL_REQUIRED');
    if (!isValidEmail(email)) throw new Error('AUTH_EMAIL_INVALID');
    if (!resetCode) throw new Error('AUTH_RESET_CODE_REQUIRED');
    if (!newPassword) throw new Error('AUTH_PASSWORD_REQUIRED');
    if (newPassword.length < 8) throw new Error('AUTH_PASSWORD_TOO_SHORT');

    const resets = readPasswordResets();
    const reset = resets.find((r) => r.email === email);
    if (!reset) throw new Error('AUTH_RESET_NOT_REQUESTED');
    if (isExpired(reset.expiresAt)) throw new Error('AUTH_RESET_EXPIRED');

    const providedHash = await sha256Base64(`${reset.codeSalt}:${resetCode}`);
    if (providedHash !== reset.codeHash) throw new Error('AUTH_RESET_CODE_INVALID');

    const users = readUsers();
    const userIndex = users.findIndex((u) => u.email === email);
    if (userIndex < 0) throw new Error('AUTH_USER_NOT_FOUND');

    const passwordSalt = randomBase64(16);
    const passwordHash = await sha256Base64(`${passwordSalt}:${newPassword}`);
    users[userIndex] = {
      ...users[userIndex],
      passwordSalt,
      passwordHash,
    };
    writeUsers(users);

    const remainingResets = resets.filter((r) => r.email !== email);
    writePasswordResets(remainingResets);

    clearSession();
  }
}

export const authRepository = new MockAuthRepository();
export const __testing = {
  bytesFromBase64,
};

