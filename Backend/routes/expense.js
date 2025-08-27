import express from 'express';
import { body, validationResult } from 'express-validator';
import Expense from '../models/Expense.js';
import Budget from '../models/Budget.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/expenses
// @desc    Create a new expense
// @access  Private
router.post('/', protect, [
  body('name')
    .notEmpty()
    .withMessage('Expense name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('category')
    .isIn(['Shopping', 'Food', 'Transport', 'Entertainment', 'Healthcare', 'Education', 'Home', 'Other'])
    .withMessage('Invalid category'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO date'),
  body('receipt')
    .optional()
    .isBoolean()
    .withMessage('Receipt must be a boolean'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('budget')
    .optional()
    .isMongoId()
    .withMessage('Budget ID must be a valid MongoDB ID')
], async (req, res) => {
  try {
    // Debug: Log the request body
    console.log('Request body:', req.body);
    console.log('Request body type:', typeof req.body);
    console.log('Request body keys:', Object.keys(req.body));

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { name, amount, category, date, receipt, description, budget } = req.body;

    // If budget is provided, verify it exists and belongs to user
    if (budget) {
      const budgetExists = await Budget.findOne({
        _id: budget,
        user: req.user.id,
        isActive: true
      });

      if (!budgetExists) {
        return res.status(400).json({
          success: false,
          message: 'Invalid budget ID'
        });
      }
    }

    // Create new expense
    const expense = await Expense.create({
      name,
      amount,
      category,
      date: date || new Date(),
      receipt: receipt || false,
      description,
      budget,
      user: req.user.id
    });

    // If budget is provided, update budget spent amount
    if (budget) {
      await Budget.findByIdAndUpdate(budget, {
        $inc: { spent: amount }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Expense created successfully',
      data: {
        expense
      }
    });
  } catch (error) {
    console.error('Expense creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating expense'
    });
  }
});

// @route   POST /api/expenses/bulk
// @desc    Create multiple expenses at once
// @access  Private
router.post('/bulk', protect, [
  body('expenses')
    .isArray({ min: 1 })
    .withMessage('Expenses must be an array with at least one item'),
  body('expenses.*.name')
    .notEmpty()
    .withMessage('Expense name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('expenses.*.amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('expenses.*.category')
    .isIn(['Shopping', 'Food', 'Transport', 'Entertainment', 'Healthcare', 'Education', 'Home', 'Other'])
    .withMessage('Invalid category'),
  body('expenses.*.date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO date'),
  body('expenses.*.receipt')
    .optional()
    .isBoolean()
    .withMessage('Receipt must be a boolean'),
  body('expenses.*.description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('expenses.*.budget')
    .optional()
    .isMongoId()
    .withMessage('Budget ID must be a valid MongoDB ID')
], async (req, res) => {
  try {
    // Debug: Log the request body
    console.log('Bulk request body:', req.body);
    console.log('Expenses array:', req.body.expenses);

    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Bulk validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { expenses } = req.body;
    const createdExpenses = [];
    const budgetUpdates = {};

    // Process each expense
    for (const expenseData of expenses) {
      const { name, amount, category, date, receipt, description, budget } = expenseData;

      // If budget is provided, verify it exists and belongs to user
      if (budget) {
        const budgetExists = await Budget.findOne({
          _id: budget,
          user: req.user.id,
          isActive: true
        });

        if (!budgetExists) {
          return res.status(400).json({
            success: false,
            message: `Invalid budget ID: ${budget}`
          });
        }

        // Track budget updates
        if (!budgetUpdates[budget]) {
          budgetUpdates[budget] = 0;
        }
        budgetUpdates[budget] += amount;
      }

      // Create expense
      const expense = await Expense.create({
        name,
        amount,
        category,
        date: date || new Date(),
        receipt: receipt || false,
        description,
        budget,
        user: req.user.id
      });

      createdExpenses.push(expense);
    }

    // Update budget spent amounts
    for (const [budgetId, totalSpent] of Object.entries(budgetUpdates)) {
      await Budget.findByIdAndUpdate(budgetId, {
        $inc: { spent: totalSpent }
      });
    }

    res.status(201).json({
      success: true,
      message: `${createdExpenses.length} expenses created successfully`,
      data: {
        expenses: createdExpenses,
        count: createdExpenses.length
      }
    });
  } catch (error) {
    console.error('Bulk expense creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating expenses'
    });
  }
});

// @route   GET /api/expenses
// @desc    Get all expenses for a user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      search, 
      startDate, 
      endDate,
      budget,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;
    
    // Build query
    const query = { user: req.user.id, isActive: true };
    
    if (category && category !== 'All') {
      query.category = category;
    }
    
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (budget) {
      query.budget = budget;
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const expenses = await Expense.find(query)
      .populate('budget', 'title category')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Get total count
    const total = await Expense.countDocuments(query);

    res.json({
      success: true,
      data: {
        expenses,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Expense fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching expenses'
    });
  }
});

// @route   GET /api/expenses/:id
// @desc    Get a specific expense
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user.id,
      isActive: true
    }).populate('budget', 'title category');

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      data: {
        expense
      }
    });
  } catch (error) {
    console.error('Expense fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching expense'
    });
  }
});

// @route   PUT /api/expenses/:id
// @desc    Update an expense
// @access  Private
router.put('/:id', protect, [
  body('name')
    .optional()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('category')
    .optional()
    .isIn(['Shopping', 'Food', 'Transport', 'Entertainment', 'Healthcare', 'Education', 'Home', 'Other'])
    .withMessage('Invalid category'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Date must be a valid ISO date'),
  body('receipt')
    .optional()
    .isBoolean()
    .withMessage('Receipt must be a boolean'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('budget')
    .optional()
    .isMongoId()
    .withMessage('Budget ID must be a valid MongoDB ID')
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

    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user.id,
      isActive: true
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Handle budget amount adjustment if amount changed
    if (req.body.amount !== undefined && req.body.amount !== expense.amount) {
      const amountDifference = req.body.amount - expense.amount;
      
      // Update old budget if it exists
      if (expense.budget) {
        await Budget.findByIdAndUpdate(expense.budget, {
          $inc: { spent: amountDifference }
        });
      }
      
      // Update new budget if it's different
      if (req.body.budget && req.body.budget !== expense.budget) {
        await Budget.findByIdAndUpdate(req.body.budget, {
          $inc: { spent: req.body.amount }
        });
      }
    }

    // Update expense
    const updatedExpense = await Expense.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('budget', 'title category');

    res.json({
      success: true,
      message: 'Expense updated successfully',
      data: {
        expense: updatedExpense
      }
    });
  } catch (error) {
    console.error('Expense update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating expense'
    });
  }
});

// @route   DELETE /api/expenses/:id
// @desc    Delete an expense (soft delete)
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      user: req.user.id,
      isActive: true
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Update budget spent amount if expense was linked to a budget
    if (expense.budget) {
      await Budget.findByIdAndUpdate(expense.budget, {
        $inc: { spent: -expense.amount }
      });
    }

    // Soft delete
    expense.isActive = false;
    await expense.save();

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Expense deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting expense'
    });
  }
});

// @route   GET /api/expenses/summary/overview
// @desc    Get expense summary overview
// @access  Private
router.get('/summary/overview', protect, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const query = { user: req.user.id, isActive: true };
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find(query);

    const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const expenseCount = expenses.length;

    // Category-wise breakdown
    const categoryBreakdown = {};
    expenses.forEach(expense => {
      if (!categoryBreakdown[expense.category]) {
        categoryBreakdown[expense.category] = {
          totalSpent: 0,
          count: 0
        };
      }
      categoryBreakdown[expense.category].totalSpent += expense.amount;
      categoryBreakdown[expense.category].count += 1;
    });

    // Monthly breakdown for current year
    const currentYear = new Date().getFullYear();
    const monthlyBreakdown = {};
    for (let month = 1; month <= 12; month++) {
      monthlyBreakdown[month] = {
        totalSpent: 0,
        count: 0
      };
    }

    expenses.forEach(expense => {
      const expenseDate = new Date(expense.date);
      if (expenseDate.getFullYear() === currentYear) {
        const month = expenseDate.getMonth() + 1;
        monthlyBreakdown[month].totalSpent += expense.amount;
        monthlyBreakdown[month].count += 1;
      }
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalSpent,
          expenseCount
        },
        categoryBreakdown,
        monthlyBreakdown
      }
    });
  } catch (error) {
    console.error('Expense summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching expense summary'
    });
  }
});

export default router; 