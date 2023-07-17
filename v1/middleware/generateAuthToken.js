import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Users from '../model/user.js';

dotenv.config();

export function generateAccessToken(accountNumber, role) {
  // Generate an access token with a short expiration time
  return jwt.sign({ accountNumber, role }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
}

export function generateRefreshToken(accountNumber, role) {
  // Generate a refresh token with a longer expiration time
  return jwt.sign({ accountNumber, role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
}

export const isUserAuthenticated = async (req, res, next) => {
  let result;
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res
      .status(400)
      .json({ error: true, message: 'Access token missing' });
  }

  const token = req.headers.authorization.split(' ')[1];

  try {
    let user = await Users.find({ token: token });
    if (!user) {
      return res
        .status(400)
        .json({ error: true, message: 'Access token not found' });
    }

    result = jwt.verify(token, process.env.JWT_SECRET);
    if (
      !result.accountNumber === user.accountNumber &&
      !result.role === user.role
    ) {
      return result.status(401).json({ error: true, message: 'invalid token' });
    }

    req.decoded = result;

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({
        error: true,
        message: 'Token expired',
      });
    }

    return res.status(403).json({
      error: true,
      message: 'Authentication error',
    });
  }
};

export default {
  isUserAuthenticated,
  generateAccessToken,
  generateRefreshToken,
};
