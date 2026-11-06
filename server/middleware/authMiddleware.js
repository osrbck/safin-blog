const jwt = require('jsonwebtoken');
const HttpError = require('../utils/httpError');
const { jwtSecret } = require('../config/env');

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new HttpError('Unauthorized. Please sign in.', 401));
  }

  try {
    const payload = jwt.verify(token, jwtSecret);
    req.user = { id: payload.id, name: payload.name };
    next();
  } catch {
    next(new HttpError('Your session has expired. Please sign in again.', 401));
  }
};

/** Populates req.user when a valid token is present but never rejects the request. */
const optionalAuth = (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || '').split(' ');
  if (scheme === 'Bearer' && token) {
    try {
      const payload = jwt.verify(token, jwtSecret);
      req.user = { id: payload.id, name: payload.name };
    } catch {
      /* treat as anonymous */
    }
  }
  next();
};

module.exports = authMiddleware;
module.exports.optionalAuth = optionalAuth;
