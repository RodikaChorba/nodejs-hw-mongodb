import { HttpError } from 'http-errors';

export const errorHandler = (err, req, res, next) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({
      message: err.name,
      error: err,
    });
    return;
  }

  res.status(500).json({
    status: err.status,
    message: 'Something went wrong.',
    data: err.message,
  });
};
