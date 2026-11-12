import { useSyncExternalStore } from 'react';

import { readItem, writeItem } from './storage';

/**
 * Cliente simulado con la misma forma que el cliente de Better Auth:
 * signIn.email, signUp.email, signOut y useSession. Las llamadas devuelven { data, error }.
 */

export const DEMO_CREDENTIALS = { email: 'demo@talentmatch.ai', password: 'Demo1234' };

const SESSION_KEY = 'matchai.mock.session';
const USERS_KEY = 'matchai.mock.users';
const LATENCY = 700;
const MIN_PASSWORD_LENGTH = 8;
const DEMO_USER = {
  id: 'user_demo',
  name: 'Laura Méndez',
  email: DEMO_CREDENTIALS.email,
  password: DEMO_CREDENTIALS.password,
};

let users = [DEMO_USER];
let state = { data: null, isPending: true, error: null };
const listeners = new Set();

function setState(next) {
  state = { ...state, ...next };
  listeners.forEach((listener) => listener());
}

function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const getSnapshot = () => state;
const wait = () => new Promise((resolve) => setTimeout(resolve, LATENCY));
const failure = (code, message, status) => ({ data: null, error: { code, message, status } });
const normalizeEmail = (email) => (email ?? '').trim().toLowerCase();

function publicUser(user) {
  const now = new Date().toISOString();
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    emailVerified: false,
    image: null,
    createdAt: now,
    updatedAt: now,
  };
}

async function startSession(user) {
  const data = {
    user: publicUser(user),
    session: {
      id: `session_${Date.now()}`,
      userId: user.id,
      token: `mock_${Math.random().toString(36).slice(2)}`,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
  };
  await writeItem(SESSION_KEY, JSON.stringify(data));
  setState({ data, error: null });
  return data;
}

async function hydrate() {
  try {
    const storedUsers = await readItem(USERS_KEY);
    if (storedUsers) {
      const extra = JSON.parse(storedUsers).filter(
        (stored) => !users.some((user) => user.email === stored.email),
      );
      users = [...users, ...extra];
    }
    const stored = await readItem(SESSION_KEY);
    const data = stored ? JSON.parse(stored) : null;
    const valid = Boolean(data?.session && new Date(data.session.expiresAt) > new Date());
    setState({ data: valid ? data : null, isPending: false });
  } catch {
    setState({ data: null, isPending: false });
  }
}

hydrate();

export const mockAuthClient = {
  signIn: {
    async email({ email, password }) {
      await wait();
      const user = users.find((candidate) => candidate.email === normalizeEmail(email));
      if (!user || user.password !== password) {
        return failure('INVALID_EMAIL_OR_PASSWORD', 'Invalid email or password', 401);
      }
      const data = await startSession(user);
      return { data: { token: data.session.token, user: data.user, redirect: false }, error: null };
    },
  },
  signUp: {
    async email({ name, email, password }) {
      await wait();
      const normalized = normalizeEmail(email);
      if (!password || password.length < MIN_PASSWORD_LENGTH) {
        return failure('PASSWORD_TOO_SHORT', 'Password too short', 400);
      }
      if (users.some((user) => user.email === normalized)) {
        return failure('USER_ALREADY_EXISTS', 'User already exists', 422);
      }
      const user = { id: `user_${Date.now()}`, name: name.trim(), email: normalized, password };
      users = [...users, user];
      await writeItem(USERS_KEY, JSON.stringify(users.filter((item) => item.id !== DEMO_USER.id)));
      const data = await startSession(user);
      return { data: { token: data.session.token, user: data.user }, error: null };
    },
  },
  async signOut() {
    await wait();
    await writeItem(SESSION_KEY, null);
    setState({ data: null, error: null });
    return { data: { success: true }, error: null };
  },
  useSession() {
    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  },
};
