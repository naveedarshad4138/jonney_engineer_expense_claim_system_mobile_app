const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  category: String,
  jobs: [Number],
  total: Number,
  receiptUrl: String,
});

const claimSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', // assuming you have a User model
  },
  fromDate: Date,
  toDate: Date,
  name: String,
  approvedBy: String,
  notes: String,
  expenses: [expenseSchema],
  totalAmount: Number,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'], // allowed values
    default: 'pending', // default status on creation
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Claims', claimSchema);
