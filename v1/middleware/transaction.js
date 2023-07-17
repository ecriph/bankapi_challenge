import Users from '../model/user.js';
import HttpError from './http-error.js';

export const updateBalance = async (accountNumber, amount) => {
  let response;
  try {
    response = await Users.findOne({ accountNumber: accountNumber });
  } catch (err) {
    const error = new HttpError('Error while updating', 402);
    return { status: false, message: 'Transaction failed' };
  }

  if (response.balance < amount) {
    return { status: false, message: 'insufficient balance' };
  } else {
    const currentBalance = response.balance - amount;
    response.balance = currentBalance;
    response.save();
    return { status: true, message: 'success' };
  }
};
