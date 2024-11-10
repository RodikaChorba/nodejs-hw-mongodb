import { THIRTY_DAYS, ONE_DAY } from '../constants/index.js';
import { registerUser } from '../services/auth.js';
import { loginUser } from '../services/auth.js';
import { logoutUser } from '../services/auth.js';
import { refreshUsersSession } from '../services/auth.js';
import { requestResetToken } from '../services/auth.js';
import { resetPassword } from '../services/auth.js';
import { generateAuthUrl } from '../utils/googleOAuth2.js';
import { loginOrSignupWithGoogle } from '../services/auth.js';

export const registerUserController = async (req, res) => {
  try {
    const user = await registerUser(req.body);
    res.status(201).json({
      status: 201,
      message: 'Successfully registered a user!',
      data: user,
    });
  } catch (error) {
    console.error('Error in registerUserController:', error.message);
    res.status(500).json({
      message: 'InternalServerError',
      data: {
        message: error.message,
      },
    });
  }
};

export const loginUserController = async (req, res) => {
  try {
    const session = await loginUser(req.body);
    res.cookie('refreshToken', session.refreshToken, {
      httpOnly: true,
      expires: new Date(Date.now() + THIRTY_DAYS),
    });

    res.cookie('sessionId', session._id, {
      httpOnly: true,
      expires: new Date(Date.now() + THIRTY_DAYS),
    });
    res.json({
      status: 200,
      message: 'Successfully logged in a user!',
      data: {
        accessToken: session.accessToken,
      },
    });
  } catch (error) {
    console.error('Error in loginUserController:', error.message);
    res.status(500).json({
      message: 'InternalServerError',
      data: {
        message: error.message,
      },
    });
  }
};

export const logoutUserController = async (req, res) => {
  try {
    if (req.cookies.sessionId) {
      await logoutUser(req.cookies.sessionId);
    }

    res.clearCookie('sessionId');
    res.clearCookie('refreshToken');

    res.status(204).send();
  } catch (error) {
    console.error('Error in logoutUserController:', error.message);
    res.status(500).json({
      message: 'InternalServerError',
      data: {
        message: error.message,
      },
    });
  }
};

const setupSession = (res, session) => {
  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });
  res.cookie('sessionId', session._id, {
    httpOnly: true,
    expires: new Date(Date.now() + ONE_DAY),
  });
};

export const refreshUserSessionController = async (req, res) => {
  try {
    const session = await refreshUsersSession({
      sessionId: req.cookies.sessionId,
      refreshToken: req.cookies.refreshToken,
    });

    setupSession(res, session);

    res.json({
      status: 200,
      message: 'Successfully refreshed a session!',
      data: {
        accessToken: session.accessToken,
      },
    });
  } catch (error) {
    console.error('Error in refreshUserSessionController:', error.message);
    res.status(500).json({
      message: 'InternalServerError',
      data: {
        message: error.message,
      },
    });
  }
};

export const sendtResetEmailController = async (req, res) => {
  try {
    console.log('Received request for email reset:', req.body.email);
    await requestResetToken(req.body.email);
    res.json({
      message: 'Reset password email has been successfully sent.',
      status: 200,
      data: {},
    });
  } catch (error) {
    console.error('Error in sendtResetEmailController:', error.message);
    res.status(500).json({
      message: 'InternalServerError',
      data: {
        message: 'Failed to send the email, please try again later.',
      },
    });
  }
};

export const resetPasswordController = async (req, res) => {
  try {
    await resetPassword(req.body);
    res.json({
      message: 'Password was successfully reset!',
      status: 200,
      data: {},
    });
  } catch (error) {
    console.error('Error in resetPasswordController:', error.message);
    res.status(500).json({
      message: 'InternalServerError',
      data: {
        message: error.message,
      },
    });
  }
};
export const getGoogleOAuthUrlController = async (req, res) => {
  const url = generateAuthUrl();
  res.json({
    status: 200,
    message: 'Successfully get Google OAuth url!',
    data: {
      url,
    },
  });
};

export const loginWithGoogleController = async (req, res) => {
  const session = await loginOrSignupWithGoogle(req.body.code);
  setupSession(res, session);

  res.json({
    status: 200,
    message: 'Successfully logged in via Google OAuth!',
    data: {
      accessToken: session.accessToken,
    },
  });
};
