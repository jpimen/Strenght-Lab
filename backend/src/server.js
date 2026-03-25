import { createServer } from 'node:http';
import { pbkdf2Sync, randomBytes, randomInt, randomUUID, timingSafeEqual } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HOST = process.env.HOST ?? '0.0.0.0';
const PORT = Number(process.env.PORT ?? '4000');
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const PASSWORD_RESET_TTL_MS = 1000 * 60 * 15;
const PBKDF2_ITERATIONS = 120_000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const RESETS_FILE = path.join(DATA_DIR, 'password_resets.json');

class AuthApiError extends Error {
  constructor(code, status = 400) {
    super(code);
    this.code = code;
    this.status = status;
  }
}

function normalizeEmail(email) {
  return String(email ?? '').trim().toLowerCase();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function nowIso() {
  return new Date().toISOString();
}

function isExpired(expiresAt) {
  return Date.now() > Date.parse(expiresAt);
}

function hashSecret(saltHex, text) {
  return pbkdf2Sync(text, Buffer.from(saltHex, 'hex'), PBKDF2_ITERATIONS, 32, 'sha256').toString('hex');
}

function toPublicUser(user) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    createdAt: user.createdAt,
  };
}

function withCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization');
}

function sendJson(res, status, body) {
  withCors(res);
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(payload).toString(),
  });
  res.end(payload);
}

function sendNoContent(res) {
  withCors(res);
  res.writeHead(204);
  res.end();
}

function getBearerToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const prefix = 'Bearer ';
  if (!authHeader.startsWith(prefix)) return null;
  const token = authHeader.slice(prefix.length).trim();
  return token || null;
}

async function parseJsonBody(req) {
  const chunks = [];
  let byteLength = 0;

  for await (const chunk of req) {
    byteLength += chunk.length;
    if (byteLength > 1024 * 1024) {
      throw new AuthApiError('AUTH_REQUEST_TOO_LARGE', 413);
    }
    chunks.push(chunk);
  }

  if (chunks.length === 0) return {};
  const raw = Buffer.concat(chunks).toString('utf8').trim();
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch {
    throw new AuthApiError('AUTH_INVALID_REQUEST', 400);
  }
}

async function ensureDataFiles() {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await ensureJsonFile(USERS_FILE, []);
  await ensureJsonFile(SESSIONS_FILE, []);
  await ensureJsonFile(RESETS_FILE, []);
}

async function ensureJsonFile(filePath, fallback) {
  try {
    await fs.access(filePath);
  } catch {
    await fs.writeFile(filePath, JSON.stringify(fallback, null, 2), 'utf8');
  }
}

async function readJsonFile(filePath, fallback) {
  await ensureJsonFile(filePath, fallback);
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    if (!raw.trim()) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function writeJsonFile(filePath, value) {
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf8');
}

async function readUsers() {
  return readJsonFile(USERS_FILE, []);
}

async function writeUsers(users) {
  await writeJsonFile(USERS_FILE, users);
}

async function readSessions() {
  return readJsonFile(SESSIONS_FILE, []);
}

async function writeSessions(sessions) {
  await writeJsonFile(SESSIONS_FILE, sessions);
}

async function readResets() {
  return readJsonFile(RESETS_FILE, []);
}

async function writeResets(resets) {
  await writeJsonFile(RESETS_FILE, resets);
}

function mapSession(session, user) {
  return {
    token: session.token,
    user: toPublicUser(user),
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
  };
}

async function handleSignUp(req, res) {
  const body = await parseJsonBody(req);
  const fullName = String(body.fullName ?? '').trim();
  const email = normalizeEmail(body.email);
  const password = String(body.password ?? '');

  if (!fullName) throw new AuthApiError('AUTH_FULL_NAME_REQUIRED');
  if (!email) throw new AuthApiError('AUTH_EMAIL_REQUIRED');
  if (!isValidEmail(email)) throw new AuthApiError('AUTH_EMAIL_INVALID');
  if (!password) throw new AuthApiError('AUTH_PASSWORD_REQUIRED');
  if (password.length < 8) throw new AuthApiError('AUTH_PASSWORD_TOO_SHORT');

  const users = await readUsers();
  if (users.some((user) => user.email === email)) {
    throw new AuthApiError('AUTH_EMAIL_IN_USE', 409);
  }

  const passwordSalt = randomBytes(16).toString('hex');
  const passwordHash = hashSecret(passwordSalt, password);
  const user = {
    id: randomUUID(),
    fullName,
    email,
    passwordSalt,
    passwordHash,
    createdAt: nowIso(),
  };

  users.push(user);
  await writeUsers(users);

  const session = {
    token: randomUUID(),
    userId: user.id,
    createdAt: nowIso(),
    expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
  };

  const sessions = await readSessions();
  sessions.push(session);
  await writeSessions(sessions);

  sendJson(res, 201, mapSession(session, user));
}

async function handleLogIn(req, res) {
  const body = await parseJsonBody(req);
  const email = normalizeEmail(body.email);
  const password = String(body.password ?? '');

  if (!email) throw new AuthApiError('AUTH_EMAIL_REQUIRED');
  if (!isValidEmail(email)) throw new AuthApiError('AUTH_EMAIL_INVALID');
  if (!password) throw new AuthApiError('AUTH_PASSWORD_REQUIRED');

  const users = await readUsers();
  const user = users.find((candidate) => candidate.email === email);
  if (!user) throw new AuthApiError('AUTH_INVALID_CREDENTIALS', 401);

  const expectedHash = hashSecret(user.passwordSalt, password);
  const actualBuffer = Buffer.from(user.passwordHash, 'hex');
  const expectedBuffer = Buffer.from(expectedHash, 'hex');
  const isMatch =
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer);
  if (!isMatch) throw new AuthApiError('AUTH_INVALID_CREDENTIALS', 401);

  const session = {
    token: randomUUID(),
    userId: user.id,
    createdAt: nowIso(),
    expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
  };

  const sessions = await readSessions();
  sessions.push(session);
  await writeSessions(sessions);

  sendJson(res, 200, mapSession(session, user));
}

async function handleGetSession(req, res) {
  const token = getBearerToken(req);
  if (!token) throw new AuthApiError('AUTH_UNAUTHORIZED', 401);

  const sessions = await readSessions();
  const session = sessions.find((candidate) => candidate.token === token);
  if (!session) throw new AuthApiError('AUTH_INVALID_SESSION', 401);

  if (isExpired(session.expiresAt)) {
    const remainingSessions = sessions.filter((candidate) => candidate.token !== token);
    await writeSessions(remainingSessions);
    throw new AuthApiError('AUTH_INVALID_SESSION', 401);
  }

  const users = await readUsers();
  const user = users.find((candidate) => candidate.id === session.userId);
  if (!user) {
    const remainingSessions = sessions.filter((candidate) => candidate.token !== token);
    await writeSessions(remainingSessions);
    throw new AuthApiError('AUTH_INVALID_SESSION', 401);
  }

  sendJson(res, 200, mapSession(session, user));
}

async function handleLogOut(req, res) {
  const token = getBearerToken(req);
  if (!token) {
    sendNoContent(res);
    return;
  }

  const sessions = await readSessions();
  const remainingSessions = sessions.filter((candidate) => candidate.token !== token);
  if (remainingSessions.length !== sessions.length) {
    await writeSessions(remainingSessions);
  }

  sendNoContent(res);
}

async function handleRequestPasswordReset(req, res) {
  const body = await parseJsonBody(req);
  const email = normalizeEmail(body.email);

  if (!email) throw new AuthApiError('AUTH_EMAIL_REQUIRED');
  if (!isValidEmail(email)) throw new AuthApiError('AUTH_EMAIL_INVALID');

  const users = await readUsers();
  const user = users.find((candidate) => candidate.email === email);
  if (!user) throw new AuthApiError('AUTH_USER_NOT_FOUND', 404);

  const resetCode = randomInt(0, 1_000_000).toString().padStart(6, '0');
  const codeSalt = randomBytes(16).toString('hex');
  const codeHash = hashSecret(codeSalt, resetCode);
  const challenge = {
    email,
    codeSalt,
    codeHash,
    createdAt: nowIso(),
    expiresAt: new Date(Date.now() + PASSWORD_RESET_TTL_MS).toISOString(),
  };

  const resets = await readResets();
  const remainingResets = resets.filter((item) => item.email !== email);
  remainingResets.push(challenge);
  await writeResets(remainingResets);

  sendJson(res, 200, {
    email,
    resetCode,
    expiresAt: challenge.expiresAt,
  });
}

async function handleConfirmPasswordReset(req, res) {
  const body = await parseJsonBody(req);
  const email = normalizeEmail(body.email);
  const resetCode = String(body.resetCode ?? '').trim();
  const newPassword = String(body.newPassword ?? '');

  if (!email) throw new AuthApiError('AUTH_EMAIL_REQUIRED');
  if (!isValidEmail(email)) throw new AuthApiError('AUTH_EMAIL_INVALID');
  if (!resetCode) throw new AuthApiError('AUTH_RESET_CODE_REQUIRED');
  if (!newPassword) throw new AuthApiError('AUTH_PASSWORD_REQUIRED');
  if (newPassword.length < 8) throw new AuthApiError('AUTH_PASSWORD_TOO_SHORT');

  const resets = await readResets();
  const reset = resets.find((candidate) => candidate.email === email);
  if (!reset) throw new AuthApiError('AUTH_RESET_NOT_REQUESTED');
  if (isExpired(reset.expiresAt)) throw new AuthApiError('AUTH_RESET_EXPIRED');

  const expectedHash = hashSecret(reset.codeSalt, resetCode);
  const actualBuffer = Buffer.from(reset.codeHash, 'hex');
  const expectedBuffer = Buffer.from(expectedHash, 'hex');
  const isMatch =
    actualBuffer.length === expectedBuffer.length &&
    timingSafeEqual(actualBuffer, expectedBuffer);
  if (!isMatch) throw new AuthApiError('AUTH_RESET_CODE_INVALID');

  const users = await readUsers();
  const userIndex = users.findIndex((candidate) => candidate.email === email);
  if (userIndex < 0) throw new AuthApiError('AUTH_USER_NOT_FOUND', 404);

  const newSalt = randomBytes(16).toString('hex');
  users[userIndex] = {
    ...users[userIndex],
    passwordSalt: newSalt,
    passwordHash: hashSecret(newSalt, newPassword),
  };
  await writeUsers(users);

  const remainingResets = resets.filter((candidate) => candidate.email !== email);
  await writeResets(remainingResets);

  const sessions = await readSessions();
  const remainingSessions = sessions.filter((candidate) => candidate.userId !== users[userIndex].id);
  await writeSessions(remainingSessions);

  sendNoContent(res);
}

function notFound(res) {
  sendJson(res, 404, { code: 'AUTH_ROUTE_NOT_FOUND' });
}

async function routeRequest(req, res) {
  if (!req.url || !req.method) {
    notFound(res);
    return;
  }

  if (req.method === 'OPTIONS') {
    sendNoContent(res);
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host ?? 'localhost'}`);
  const key = `${req.method.toUpperCase()} ${url.pathname}`;

  switch (key) {
    case 'POST /api/auth/signup':
      await handleSignUp(req, res);
      return;
    case 'POST /api/auth/login':
      await handleLogIn(req, res);
      return;
    case 'GET /api/auth/session':
      await handleGetSession(req, res);
      return;
    case 'POST /api/auth/logout':
      await handleLogOut(req, res);
      return;
    case 'POST /api/auth/password-reset/request':
      await handleRequestPasswordReset(req, res);
      return;
    case 'POST /api/auth/password-reset/confirm':
      await handleConfirmPasswordReset(req, res);
      return;
    default:
      notFound(res);
  }
}

const server = createServer(async (req, res) => {
  try {
    await routeRequest(req, res);
  } catch (error) {
    if (error instanceof AuthApiError) {
      sendJson(res, error.status, { code: error.code });
      return;
    }

    console.error('Unhandled auth server error:', error);
    sendJson(res, 500, { code: 'AUTH_SERVER_ERROR' });
  }
});

await ensureDataFiles();

server.listen(PORT, HOST, () => {
  console.log(`Auth backend running at http://${HOST}:${PORT}`);
});
