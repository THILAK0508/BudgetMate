import mongoose from 'mongoose';

const budgetSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Budget title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  amount: {
    type: Number,
    required: [true, 'Budget amount is required'],
    min: [0, 'Amount cannot be negative']
  },
  items: {
    type: Number,
    default: 0
  },
  spent: {
    type: Number,
    default: 0,
    min: [0, 'Spent amount cannot be negative']
  },
  remaining: {
    type: Number,
    default: function() {
      return this.amount - this.spent;
    },
    min: [0, 'Remaining amount cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Budget category is required'],
    enum: ['Shopping', 'Food', 'Transport', 'Entertainment', 'Healthcare', 'Education', 'Home', 'Other'],
    default: 'Other'
  },
  icon: {
    type: String,
    default: '💰'
  },
  color: {
    type: String,
    default: 'blue'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Calculate remaining amount before saving
budgetSchema.pre('save', function(next) {
  this.remaining = this.amount - this.spent;
  next();
});

// Virtual for spending percentage
budgetSchema.virtual('spendingPercentage').get(function() {
  if (this.amount === 0) return 0;
  return Math.round((this.spent / this.amount) * 100);
});

// Ensure virtual fields are serialized
budgetSchema.set('toJSON', { virtuals: true });
budgetSchema.set('toObject', { virtuals: true });

const Budget = mongoose.model('Budget', budgetSchema);

export default Budget; 