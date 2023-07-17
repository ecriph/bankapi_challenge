import Users from '../model/user.js';
import bcrypt from 'bcrypt';

export const checkifPhoneExist = async (phone) => {
  const data = await Users.findOne({ phone });
  return { status: data };
};

export const encryptPassword = async (password) => {
  const hashPassword = await bcrypt.hash(password, 12);
  return {
    encryptedPassword: hashPassword,
  };
};
