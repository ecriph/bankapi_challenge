import Users from '../model/user.js';
import HttpError from './http-error.js';

export const updateBalance = async (accountNumber, amount) => {
  await Users.findOne({ accountNumber: accountNumber })
    .then((resp) => {
      const currentBalance = resp.balance - amount;
      resp.balance = currentBalance;
      resp.save();
      return { status: true };
    })
    .catch((err) => {
      const error = new HttpError('Error while updating', 402);
      return { status: false };
    });
};
