import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {
  generateAccessToken,
  generateRefreshToken,
} from '../middleware/generateAuthToken.js';
import Users from '../model/user.js';
import HttpError from '../middleware/http-error.js';
import redis from 'redis';
import { generateAccountNumber } from '../middleware/accountGenerator.js';
import {
  checkifPhoneExist,
  encryptPassword,
} from '../middleware/registrationAuth.js';
import Transfers from '../model/transaction.js';
import { updateBalance } from '../middleware/transaction.js';

export const SignIn = async (req, res, next) => {
  const error = validationResult(req);
  if (error.isEmpty()) {
    const { accountNumber, password } = req.body;

    await Users.findOne({ accountNumber })
      .then((response) => {
        if (response.password) {
          let isValidated = false;
          isValidated = bcrypt.compareSync(password, response.password);
          if (isValidated) {
            const token = generateAccessToken(accountNumber, response.role);
            const refreshToken = generateRefreshToken(
              accountNumber,
              response.role
            );
            response.token = token;
            response.save();
            res.status(200).json({
              message: 'successful',
              user: response.toObject({ getters: true }),
              token: token,
              refreshToken: refreshToken,
            });
          } else {
            const error5 = new HttpError('Invalid Password', 402);
            next(error5);
          }
        } else {
          const error4 = new HttpError(
            'Password does not match eaccount, please try again',
            401
          );
          next(error4);
        }
      })
      .catch((err) => {
        const error2 = new HttpError('Account number does not exist', 403);
        next(error2);
      });
  } else {
    const error1 = new HttpError(
      'Invalid parameters entered' + JSON.stringify(error),
      401
    );
    return next(error1);
  }
};
export const SignUp = async (req, res, next) => {
  const error = validationResult(req);
  if (error.isEmpty()) {
    const role = 'user';
    const { firstName, lastName, password, phone, pin } = req.body;
    const accountNumber = generateAccountNumber();
    const { status } = await checkifPhoneExist(phone);
    const { encryptedPassword } = await encryptPassword(password);
    const token = generateAccessToken(accountNumber, role);
    const refreshToken = generateRefreshToken(accountNumber, role);

    if (status) {
      const error = new HttpError('phone number already registered', 401);
      next(error);
    } else {
      await Users.create({
        firstName: firstName,
        lastName: lastName,
        password: encryptedPassword,
        pin: pin,
        accountNumber: accountNumber,
        phone: phone,
        token: token,
        role: role,
      })
        .then((response) => {
          res.status(200).json({
            user: response.toObject({ getters: true }),
            message: 'account created',
            token: token,
            refreshToken: refreshToken,
          });
        })
        .catch((err) => {
          const error = new HttpError('Internal server error' + err, 500);
          next(error);
        });
    }
  } else {
    const error = new HttpError('Invalid parameters', 401);
    next(error);
  }
};
export const Transfer = async (req, res, next) => {
  const error = validationResult(req);
  if (error.isEmpty()) {
    const {
      accountNumber,
      amount,
      recipientName,
      recipientBank,
      recipientBankAccount,
      description,
    } = req.body;

    const { status, message } = await updateBalance(accountNumber, amount);
    if (status) {
      await Transfers.create({
        accountNumber,
        amount,
        recipientName,
        recipientBank,
        recipientBankAccount,
        description,
        status: true,
      })
        .then((resp) => {
          res.status(200).json({
            message: 'successful',
            data: resp.toObject({ getters: true }),
          });
        })
        .catch((err) => {
          const error = new HttpError('Transfer failed, try again', 403);
          next(error);
        });
    } else {
      const error = new HttpError(message, 403);
      next(error);
    }
  } else {
    const error1 = new HttpError(
      'Invalid parameters' + JSON.stringify(error),
      401
    );
    next(error1);
  }
};
export const RefreshToken = async (req, res, next) => {
  const redisClient = redis.createClient();
  const { refreshToken } = req.body;
  let data;

  if (!refreshToken) {
    return res.status(401).json({ error: 'Refresh token not provided' });
  }

  try {
    data = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const accessToken = generateAccessToken(data.accountNumber, data.role);
    await Users.findOneAndUpdate(
      { accountNumber: data.accountNumber },
      { token: accessToken }
    );
    res.status(200).json({ token: accessToken });

    redisClient.hSet(
      `account:${data.accountNumber}`,
      JSON.stringify(accessToken)
    );
  } catch (e) {
    const error = new HttpError('Invalid refresh token', 403);
    next(error);
  }
};

export default {
  SignIn,
  SignUp,
  Transfer,
  RefreshToken,
};
