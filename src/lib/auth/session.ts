import { getIronSession, IronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  email: string;
  projectName: string | null;
  isLoggedIn: boolean;
}

const defaultSession: SessionData = {
  email: '',
  projectName: null,
  isLoggedIn: false,
};

const sessionOptions = {
  password: process.env.SESSION_SECRET || 'complex_password_at_least_32_characters_long_replace_me',
  cookieName: 'bgi-session',
  cookieOptions: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
    maxAge: 60 * 60 * 24 * 7, // 1 week
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  const session = await getIronSession<SessionData>(cookieStore, sessionOptions);

  if (!session.isLoggedIn) {
    session.email = defaultSession.email;
    session.projectName = defaultSession.projectName;
    session.isLoggedIn = defaultSession.isLoggedIn;
  }

  return session;
}
