import mongoose from 'mongoose';

const expenseAnalyticsSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Shopping', 'Food', 'Transport', 'Entertainment', 'Healthcare', 'Education', 'Home', 'Other']
  },
  actual: {
    type: Number,
    required: [true, 'Actual spent amount is required'],
    min: [0, 'Actual amount cannot be negative']
  },
  budget: {
    type: Number,
    required: [true, 'Budgeted amount is required'],
    min: [0, 'Budget amount cannot be negative']
  },
  lastYear: {
    type: Number,
    default: 0,
    min: [0, 'Last year amount cannot be negative']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  month: {
    type: Number,
    required: [true, 'Month is required'],
    min: [1, 'Month must be between 1 and 12'],
    max: [12, 'Month must be between 1 and 12']
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [2020, 'Year must be 2020 or later']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  }
}, {
  timestamps: true
});

// Virtual for variance (difference between budget and actual)
expenseAnalyticsSchema.virtual('variance').get(function() {
  return this.budget - this.actual;
});

// Virtual for variance percentage
expenseAnalyticsSchema.virtual('variancePercentage').get(function() {
  if (this.budget === 0) return 0;
  return Math.round((this.variance / this.budget) * 100);
});

// Virtual for year-over-year change
expenseAnalyticsSchema.virtual('yearOverYearChange').get(function() {
  if (this.lastYear === 0) return 0;
  return Math.round(((this.actual - this.lastYear) / this.lastYear) * 100);
});

// Ensure virtual fields are serialized
expenseAnalyticsSchema.set('toJSON', { virtuals: true });
expenseAnalyticsSchema.set('toObject', { virtuals: true });

// Index for better query performance
expenseAnalyticsSchema.index({ user: 1, year: -1, month: -1 });
expenseAnalyticsSchema.index({ user: 1, category: 1 });

const ExpenseAnalytics = mongoose.model('ExpenseAnalytics', expenseAnalyticsSchema);

export default ExpenseAnalytics; 