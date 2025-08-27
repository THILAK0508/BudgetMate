import express from 'express';
import { body, validationResult } from 'express-validator';
import Budget from '../models/Budget.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/budgets
// @desc    Create a new budget
// @access  Private
router.post('/', protect, [
  body('title')
    .notEmpty()
    .withMessage('Budget title is required')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('category')
    .isIn(['Shopping', 'Food', 'Transport', 'Entertainment', 'Healthcare', 'Education', 'Home', 'Other'])
    .withMessage('Invalid category'),
  body('icon')
    .optional()
    .isString()
    .withMessage('Icon must be a string'),
  body('color')
    .optional()
    .isString()
    .withMessage('Color must be a string')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { title, amount, category, icon, color } = req.body;

    // Create new budget
    const budget = await Budget.create({
      title,
      amount,
      category,
      icon: icon || '💰',
      color: color || 'blue',
      user: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Budget created successfully',
      data: {
        budget
      }
    });
  } catch (error) {
    console.error('Budget creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating budget'
    });
  }
});

// @route   GET /api/budgets
// @desc    Get all budgets for a user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, search } = req.query;
    
    // Build query
    const query = { user: req.user.id, isActive: true };
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    // Execute query with pagination
    const budgets = await Budget.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count
    const total = await Budget.countDocuments(query);

    res.json({
      success: true,
      data: {
        budgets,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Budget fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching budgets'
    });
  }
});

// @route   GET /api/budgets/:id
// @desc    Get a specific budget
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user.id,
      isActive: true
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    res.json({
      success: true,
      data: {
        budget
      }
    });
  } catch (error) {
    console.error('Budget fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching budget'
    });
  }
});

// @route   PUT /api/budgets/:id
// @desc    Update a budget
// @access  Private
router.put('/:id', protect, [
  body('title')
    .optional()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('category')
    .optional()
    .isIn(['Shopping', 'Food', 'Transport', 'Entertainment', 'Healthcare', 'Education', 'Home', 'Other'])
    .withMessage('Invalid category'),
  body('icon')
    .optional()
    .isString()
    .withMessage('Icon must be a string'),
  body('color')
    .optional()
    .isString()
    .withMessage('Color must be a string')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user.id,
      isActive: true
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Update budget
    const updatedBudget = await Budget.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      message: 'Budget updated successfully',
      data: {
        budget: updatedBudget
      }
    });
  } catch (error) {
    console.error('Budget update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating budget'
    });
  }
});

// @route   DELETE /api/budgets/:id
// @desc    Delete a budget (soft delete)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const budget = await Budget.findOne({
      _id: req.params.id,
      user: req.user.id,
      isActive: true
    });

    if (!budget) {
      return res.status(404).json({
        success: false,
        message: 'Budget not found'
      });
    }

    // Soft delete
    budget.isActive = false;
    await budget.save();

    res.json({
      success: true,
      message: 'Budget deleted successfully'
    });
  } catch (error) {
    console.error('Budget deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting budget'
    });
  }
});

// @route   GET /api/budgets/summary/overview
// @desc    Get budget summary overview
// @access  Private
router.get('/summary/overview', protect, async (req, res) => {
  try {
    const budgets = await Budget.find({
      user: req.user.id,
      isActive: true
    });

    const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
    const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
    const totalRemaining = budgets.reduce((sum, budget) => sum + budget.remaining, 0);
    const budgetCount = budgets.length;

    // Category-wise breakdown
    const categoryBreakdown = {};
    budgets.forEach(budget => {
      if (!categoryBreakdown[budget.category]) {
        categoryBreakdown[budget.category] = {
          totalBudget: 0,
          totalSpent: 0,
          totalRemaining: 0,
          count: 0
        };
      }
      categoryBreakdown[budget.category].totalBudget += budget.amount;
      categoryBreakdown[budget.category].totalSpent += budget.spent;
      categoryBreakdown[budget.category].totalRemaining += budget.remaining;
      categoryBreakdown[budget.category].count += 1;
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalBudget,
          totalSpent,
          totalRemaining,
          budgetCount
        },
        categoryBreakdown
      }
    });
  } catch (error) {
    console.error('Budget summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching budget summary'
    });
  }
});

export default router; 