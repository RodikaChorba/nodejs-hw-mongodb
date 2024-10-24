import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { UsersCollection } from '../db/models/user.js';
import createHttpError from 'http-errors';
import { FIFTEEN_MINUTES, THIRTY_DAYS } from '../constants/index.js';
import { SessionsCollection } from '../db/models/session.js';

const saltRounds = 10;

export const registerUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });
  if (user) throw createHttpError(409, 'Email in use');
  const salt = await bcrypt.genSalt(saltRounds);
  const encryptedPassword = await bcrypt.hash(payload.password, salt);
  const newUser = await UsersCollection.create({
    ...payload,
    password: encryptedPassword,
  });
  const userData = newUser.toObject();
  delete userData.password;
  return userData;
};

export const loginUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });
  if (!user) {
    throw createHttpError(404, 'User not found');
  }
  const isEqual = await bcrypt.compare(payload.password, user.password);
  if (!isEqual) {
    throw createHttpError(401, 'Unauthorized');
  }
  await SessionsCollection.deleteOne({ userId: user._id });
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');
  return await SessionsCollection.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
  });
};

export const logoutUser = async (sessionId) => {
  await SessionsCollection.deleteOne({ _id: sessionId });
};

const createSession = () => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');
  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + THIRTY_DAYS),
  };
};

export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
  const session = await SessionsCollection.findOne({
    _id: sessionId,
    refreshToken,
  });
  if (!session) {
    throw createHttpError(401, 'Session not found');
  }
  const isSessionTokenExpired =
    new Date() > new Date(session.refreshTokenValidUntil);
  if (isSessionTokenExpired) {
    throw createHttpError(401, 'Session token expired');
  }
  await SessionsCollection.deleteOne({ _id: sessionId, refreshToken });
  const newSession = createSession();
  return await SessionsCollection.create({
    userId: session.userId,
    ...newSession,
  });
};
