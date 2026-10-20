import { createHash, randomBytes } from 'node:crypto';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../models/User.js';
import RefreshSession from '../../models/RefreshSession.js';
import { env } from '../../config/env.js';
import { AppError } from '../../utils/responses.js';

const hashToken = (token) => createHash('sha256').update(token).digest('hex');
const publicUser = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  emailVerifiedAt: user.emailVerifiedAt,
});
const accessToken = (user) =>
  jwt.sign({ sub: user.id }, env.JWT_ACCESS_SECRET, {
    expiresIn: env.ACCESS_TOKEN_TTL,
    issuer: 'lifeledger',
  });

async function issueSession(user) {
  const rawToken = randomBytes(48).toString('base64url');
  const expiresAt = new Date(
    Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 86400000,
  );
  await RefreshSession.create({
    userId: user.id,
    tokenHash: hashToken(rawToken),
    expiresAt,
  });
  return {
    accessToken: accessToken(user),
    refreshToken: rawToken,
    user: publicUser(user),
  };
}

export async function register(input) {
  const email = input.email.toLowerCase();
  if (await User.exists({ email })) {
    throw new AppError(
      409,
      'ACCOUNT_EXISTS',
      'Unable to create an account with those details',
    );
  }
  let user;
  try {
    user = await User.create({
      name: input.name,
      email,
      passwordHash: await bcrypt.hash(input.password, 12),
    });
  } catch (error) {
    if (error.code === 11000) {
      throw new AppError(
        409,
        'ACCOUNT_EXISTS',
        'Unable to create an account with those details',
      );
    }
    throw error;
  }
  return issueSession(user);
}

export async function login(input) {
  const user = await User.findOne({ email: input.email.toLowerCase() }).select(
    '+passwordHash',
  );
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) {
    throw new AppError(
      401,
      'INVALID_CREDENTIALS',
      'Email or password is incorrect',
    );
  }
  return issueSession(user);
}

export async function refresh(rawToken) {
  if (!rawToken)
    throw new AppError(401, 'UNAUTHENTICATED', 'Sign in to continue');
  const oldHash = hashToken(rawToken);
  const now = new Date();
  const session = await RefreshSession.findOneAndUpdate(
    {
      tokenHash: oldHash,
      revokedAt: null,
      expiresAt: { $gt: now },
    },
    { $set: { revokedAt: now, lastUsedAt: now } },
    { new: false },
  );
  if (!session)
    throw new AppError(
      401,
      'INVALID_SESSION',
      'Session expired. Please sign in again.',
    );
  const user = await User.findById(session.userId);
  if (!user)
    throw new AppError(
      401,
      'INVALID_SESSION',
      'Session expired. Please sign in again.',
    );
  return issueSession(user);
}

export async function logout(rawToken) {
  if (rawToken) {
    await RefreshSession.updateOne(
      { tokenHash: hashToken(rawToken), revokedAt: null },
      { $set: { revokedAt: new Date() } },
    );
  }
}

export async function authenticate(header) {
  const token = header?.startsWith('Bearer ') ? header.slice(7) : '';
  if (!token) throw new AppError(401, 'UNAUTHENTICATED', 'Sign in to continue');
  try {
    const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, {
      issuer: 'lifeledger',
    });
    const user = await User.findById(payload.sub);
    if (!user) throw new Error('Missing account');
    return publicUser(user);
  } catch {
    throw new AppError(401, 'UNAUTHENTICATED', 'Your session has expired');
  }
}
