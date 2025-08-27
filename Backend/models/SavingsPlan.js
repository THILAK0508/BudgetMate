import mongoose from 'mongoose';

const incomeSchema = new mongoose.Schema({
  type: {
    type: String,
    required: [true, 'Income type is required'],
    enum: ['Salary', 'Part Time', 'Commissions', 'Freelance', 'Investment', 'Other'],
    default: 'Salary'
  },
  amount: {
    type: Number,
    required: [true, 'Income amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  frequency: {
    type: String,
    enum: ['Weekly', 'Bi-weekly', 'Monthly', 'Yearly'],
    default: 'Monthly'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  }
}, {
  timestamps: true
});

const expenseSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Expense category is required'],
    enum: ['Rent', 'Electricity', 'Appliances', 'Food', 'Transport', 'Healthcare', 'Entertainment', 'Other'],
    default: 'Other'
  },
  perMonth: {
    type: Number,
    required: [true, 'Monthly expense amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  perYear: {
    type: Number,
    default: function() {
      return this.perMonth * 12;
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  }
}, {
  timestamps: true
});

const budgetSchema = new mongoose.Schema({
  monthlyBudget: {
    type: Number,
    required: [true, 'Monthly budget is required'],
    min: [0, 'Budget cannot be negative']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  }
}, {
  timestamps: true
});

// Calculate yearly expense before saving
expenseSchema.pre('save', function(next) {
  this.perYear = this.perMonth * 12;
  next();
});

const Income = mongoose.model('Income', incomeSchema);
const SavingsExpense = mongoose.model('SavingsExpense', expenseSchema);
const SavingsBudget = mongoose.model('SavingsBudget', budgetSchema);

export { Income, SavingsExpense, SavingsBudget }; 