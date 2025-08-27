import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Expense name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Expense amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  date: {
    type: Date,
    required: [true, 'Expense date is required'],
    default: Date.now
  },
  category: {
    type: String,
    required: [true, 'Expense category is required'],
    enum: ['Shopping', 'Food', 'Transport', 'Entertainment', 'Healthcare', 'Education', 'Home', 'Other'],
    default: 'Other'
  },
  receipt: {
    type: Boolean,
    default: false
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  budget: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Budget',
    required: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for better query performance
expenseSchema.index({ user: 1, date: -1 });
expenseSchema.index({ user: 1, category: 1 });
expenseSchema.index({ user: 1, budget: 1 });

const Expense = mongoose.model('Expense', expenseSchema);

export default Expense; 