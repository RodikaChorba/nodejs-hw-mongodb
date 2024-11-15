import createHttpError from 'http-errors';
import { SessionsCollection } from '../db/models/sessionModel.js';
import { UsersCollection } from '../db/models/userModel.js';

export const createSession = async (req, res, next) => {
  const authHeader = req.get('Authorization');

  if (!authHeader) {
    next(createHttpError(401, 'Please provide Authorization header'));
    return;
  }

  const bearer = authHeader.split(' ')[0];
  const token = authHeader.split(' ')[1];

  if (bearer !== 'Bearer' || !token) {
    next(createHttpError(401, 'Auth header should be of type Bearer'));
    return;
  }

  const session = await SessionsCollection.findOne({ accessToken: token });

  if (!session) {
    next(createHttpError(401, 'Session not found'));
    return;
  }

  const isSessionTokenExpired =
    new Date() > new Date(session.accessTokenValidUntil);

  if (isSessionTokenExpired) {
    next(createHttpError(401, 'Access token expired'));
    return;
  }

  const user = await UsersCollection.findOne({ _id: session.userId });

  if (!user) {
    next(createHttpError(401, 'Unauthorized'));
    return;
  }

  req.user = user;
  next();
};
