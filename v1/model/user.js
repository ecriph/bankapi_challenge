import mongoose, { Schema } from 'mongoose';

const User = new Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    phone: {
      type: Number,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    pin: {
      type: Number,
      required: true,
    },
    accountNumber: {
      type: Number,
      required: true,
      ref: 'user',
    },
    balance: {
      type: Number,
      default: 0,
    },
    role: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: false,
    },
    status: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const Users = mongoose.model('user', User);

export default Users;
