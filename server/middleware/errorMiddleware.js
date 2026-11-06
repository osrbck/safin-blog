const HttpError = require('../utils/httpError');

const notFound = (req, res, next) => {
  next(new HttpError(`Not found - ${req.originalUrl}`, 404));
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (error, req, res, next) => {
  if (res.headersSent) return next(error);

  let status = error.status || 500;
  let message = error.message || 'An unknown error occurred.';

  if (error.name === 'ValidationError') {
    status = 422;
    message = Object.values(error.errors).map((e) => e.message).join(' ');
  } else if (error.name === 'CastError') {
    status = 400;
    message = 'Invalid identifier.';
  } else if (error.code === 11000) {
    status = 409;
    message = 'That email is already registered.';
  } else if (status === 500) {
    console.error(error);
    message = 'Something went wrong on our side.';
  }

  res.status(status).json({ message });
};

module.exports = { notFound, errorHandler };
