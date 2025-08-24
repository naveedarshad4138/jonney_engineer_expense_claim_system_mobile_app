// models/ExpenseClaim.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const JobExpenseSchema = new Schema({
  category: String,
  amount: String,
  receiptUri: String,
  noReceiptFlag: Boolean,
  noReceiptReason: String,
});

const JobSchema = new Schema({
  name: String,
  expenses: [JobExpenseSchema],
});

const GeneralInfoSchema = new Schema({
  fromDate: String,
  toDate: String,
  name: String,
  approvedBy: String,
  notes: String,
});

const TotalSchema = new Schema({
  subtotal: Number,
  jobTotals: [Number],
  categoryTotals: [Number],
});

const ExpenseClaimSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: 'User', // If you have a User model
  },
  generalInfo: GeneralInfoSchema,
  jobs: [JobSchema],
  total: TotalSchema,
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Claims', ExpenseClaimSchema);
