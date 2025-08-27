import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Subscription name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  plan: {
    type: String,
    required: [true, 'Subscription plan is required'],
    trim: true,
    maxlength: [50, 'Plan description cannot exceed 50 characters']
  },
  totalSpend: {
    type: Number,
    required: [true, 'Total spend is required'],
    min: [0, 'Total spend cannot be negative']
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    trim: true,
    maxlength: [50, 'Duration cannot exceed 50 characters']
  },
  recurringPayment: {
    type: String,
    enum: ['Yes', 'No'],
    default: 'Yes'
  },
  color: {
    type: String,
    default: 'blue'
  },
  nextPaymentDate: {
    type: Date,
    default: null
  },
  category: {
    type: String,
    enum: ['Streaming', 'Software', 'Gym', 'Music', 'News', 'Other'],
    default: 'Other'
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

// Index for better query performance
subscriptionSchema.index({ user: 1, isActive: 1 });
subscriptionSchema.index({ user: 1, category: 1 });

const Subscription = mongoose.model('Subscription', subscriptionSchema);

export default Subscription; 