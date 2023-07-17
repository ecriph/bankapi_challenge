import express from 'express';
import { check } from 'express-validator';
import { isUserAuthenticated } from '../middleware/generateAuthToken.js';
import { RefreshToken, SignIn, SignUp, Transfer } from '../controller/user.js';
import cacheToken from '../middleware/cacheToken.js';

const Router = express.Router();

Router.post(
  '/signin',
  [check('accountNumber').isNumeric().notEmpty(), check('password').notEmpty()],
  SignIn
);
Router.post(
  '/signup',
  [
    check('firstName').notEmpty(),
    check('lastName').notEmpty(),
    check('phone').notEmpty(),
    check('password').notEmpty(),
    check('pin').notEmpty().isNumeric(),
  ],
  SignUp
);
Router.post(
  '/transfer',
  [
    check('accountNumber').notEmpty().isLength({ max: 10 }).isNumeric(),
    check('amount').notEmpty().isNumeric(),
    check('recipientBankAccount').notEmpty().isLength({ max: 10 }).isNumeric(),
    check('recipientName').notEmpty(),
    check('recipientBank').notEmpty(),
  ],
  isUserAuthenticated,
  Transfer
);
Router.post('/refresh', cacheToken, isUserAuthenticated, RefreshToken);

export default Router;
