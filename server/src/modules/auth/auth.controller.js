import { registerSchema, loginSchema, profileSchema } from './auth.validation.js';
import * as authService from './auth.service.js';
import { success } from '../../utils/responses.js';
import { env } from '../../config/env.js';

const cookieOptions = () => {
  const production = env.NODE_ENV === 'production';
  const sameSite = env.COOKIE_SAME_SITE;
  return {
    httpOnly: true,
    secure: production || env.COOKIE_SECURE,
    sameSite,
    ...(production && sameSite === 'none' ? { partitioned: true } : {}),
    path: '/api/v1/auth',
    maxAge: env.REFRESH_TOKEN_TTL_DAYS * 86400000,
  };
};

function sendSession(res, session) {
  res.cookie('ll_refresh', session.refreshToken, cookieOptions());
  return success(res, { accessToken: session.accessToken, user: session.user });
}

export async function register(req, res) {
  return sendSession(
    res,
    await authService.register(registerSchema.parse(req.body)),
  );
}

export async function login(req, res) {
  return sendSession(res, await authService.login(loginSchema.parse(req.body)));
}

export async function refresh(req, res) {
  return sendSession(res, await authService.refresh(req.cookies.ll_refresh));
}

export async function restoreSession(req, res) {
  if (!req.cookies.ll_refresh) {
    return success(res, { authenticated: false, user: null });
  }

  try {
    const session = await authService.refresh(req.cookies.ll_refresh);
    res.cookie('ll_refresh', session.refreshToken, cookieOptions());
    return success(res, {
      authenticated: true,
      accessToken: session.accessToken,
      user: session.user,
    });
  } catch (error) {
    if (error.status === 401) {
      res.clearCookie('ll_refresh', cookieOptions());
      return success(res, { authenticated: false, user: null });
    }
    throw error;
  }
}

export async function logout(req, res) {
  await authService.logout(req.cookies.ll_refresh);
  res.clearCookie('ll_refresh', cookieOptions());
  return success(res, null, 'Signed out');
}

export function me(req, res) {
  return success(res, { user: req.user });
}

export async function updateProfile(req, res) {
  const input = profileSchema.parse(req.body);
  return success(res, { user: await authService.updateProfile(req.user.id, input) });
}
