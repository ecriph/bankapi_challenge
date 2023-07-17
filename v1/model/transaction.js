import mongoose, { Schema } from 'mongoose';

const Transfer = new Schema(
  {
    accountNumber: {
      type: Number,
      required: false,
    },
    amount: {
      type: Number,
      required: true,
    },
    recipientBankAccount: {
      type: Number,
      required: true,
    },
    recipientName: {
      type: String,
      required: true,
    },
    recipientBank: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: false,
      default: '',
    },
    status: {
      type: Boolean,
      required: true,
      default: false,
    },
  },
  { timestamps: true }
);

const Transfers = mongoose.model('transfer', Transfer);

export default Transfers;
