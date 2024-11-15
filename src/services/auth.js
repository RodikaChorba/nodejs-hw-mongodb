import createHttpError from 'http-errors';
import { UsersCollection } from '../db/models/userModel.js';
import bcrypt from 'bcrypt';
import { SessionsCollection } from '../db/models/sessionModel.js';
import { randomBytes } from 'crypto';
import { FIFTEEN_MINUTES, SMTP, THIRTY_DAYS } from '../constants/index.js';
import jwt from 'jsonwebtoken';
import { env } from '../utils/env.js';
import { sendMail } from '../utils/sendMail.js';

export const registerUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });
  if (user) throw createHttpError(409, 'Email in use');
  const encryptedPassword = await bcrypt.hash(payload.password, 10);

  return await UsersCollection.create({
    ...payload,
    password: encryptedPassword,
  });
};

export const loginUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }

  const isEqual = await bcrypt.compare(payload.password, user.password);
  if (!isEqual) {
    throw createHttpError(401, 'Unauthorised');
  }

  await SessionsCollection.deleteOne({ userId: user._id });

  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return await SessionsCollection.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: Date.now() + FIFTEEN_MINUTES,
    refreshTokenValidUntil: Date.now() + THIRTY_DAYS,
  });
};

const createSession = () => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: Date.now() + FIFTEEN_MINUTES,
    refreshTokenValidUntil: Date.now() + THIRTY_DAYS,
  };
};

export const refreshSession = async ({ sessionId, refreshToken }) => {
  const session = await SessionsCollection.findOne({
    _id: sessionId,
    refreshToken,
  });
  if (!session) {
    throw createHttpError(401, 'Session not found');
  }

  const isTokenExpired = new Date() > new Date(session.refreshTokenValidUntil);

  if (isTokenExpired) {
    throw createHttpError(401, 'Session token expired');
  }

  const newSession = createSession();

  await SessionsCollection.deleteOne({ _id: sessionId, refreshToken });

  return await SessionsCollection.create({
    userId: session.userId,
    ...newSession,
  });
};

export const logoutUser = async (sessionId) => {
  await SessionsCollection.deleteOne({ _id: sessionId });
};

export const sendResetEmail = async (email) => {
  const user = await UsersCollection.findOne({ email });
  if (!user) {
    throw createHttpError(404, 'User not found!');
  }
  const resetToken = jwt.sign(
    {
      sub: user._id,
      email,
    },
    env('JWT_SECRET'),
    { expiresIn: '5m' },
  );
  const pathToResetTemplate = `${env(
    'APP_DOMAIN',
  )}/reset-password?token=${resetToken}`;
  try {
    await sendMail({
      from: env(SMTP.SMTP_FROM),
      to: email,
      subject: 'Request for reset password',
      html: `<p>Click <a href="${pathToResetTemplate}">here</a> to reset your password!</p>`,
    });
  } catch (error) {
    console.log(error);
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }
};

export const resetPassword = async (password, token) => {
  try {
    const decoded = jwt.verify(token, env('JWT_SECRET'));
    const user = await UsersCollection.findOne({
      _id: decoded.sub,
      email: decoded.email,
    });
    if (!user) {
      throw createHttpError(404, 'User not found!');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await UsersCollection.findByIdAndUpdate(user._id, {
      password: hashedPassword,
    });
    await SessionsCollection.findOneAndDelete({ userId: user._id });
  } catch (error) {
    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    ) {
      throw createHttpError(401, 'Token is expired or invalid.');
    }
    throw error;
  }
};
