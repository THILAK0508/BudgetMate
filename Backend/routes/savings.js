import express from 'express';
import { body, validationResult } from 'express-validator';
import { Income, SavingsExpense, SavingsBudget } from '../models/SavingsPlan.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// ==================== INCOME ROUTES ====================

// @route   POST /api/savings/income
// @desc    Add new income
// @access  Private
router.post('/income', protect, [
  body('type')
    .isIn(['Salary', 'Part Time', 'Commissions', 'Freelance', 'Investment', 'Other'])
    .withMessage('Invalid income type'),
  body('amount')
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('frequency')
    .isIn(['Weekly', 'Bi-weekly', 'Monthly', 'Yearly'])
    .withMessage('Invalid frequency')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { type, amount, frequency } = req.body;

    const income = await Income.create({
      type,
      amount,
      frequency,
      user: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Income added successfully',
      data: { income }
    });
  } catch (error) {
    console.error('Income creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding income'
    });
  }
});

// @route   GET /api/savings/income
// @desc    Get all income for user
// @access  Private
router.get('/income', protect, async (req, res) => {
  try {
    const incomes = await Income.find({
      user: req.user.id
    }).sort({ createdAt: -1 });

    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);

    res.json({
      success: true,
      data: {
        incomes,
        totalIncome
      }
    });
  } catch (error) {
    console.error('Income fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching income'
    });
  }
});

// @route   PUT /api/savings/income/:id
// @desc    Update income
// @access  Private
router.put('/income/:id', protect, [
  body('type')
    .optional()
    .isIn(['Salary', 'Part Time', 'Commissions', 'Freelance', 'Investment', 'Other'])
    .withMessage('Invalid income type'),
  body('amount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Amount must be a positive number'),
  body('frequency')
    .optional()
    .isIn(['Weekly', 'Bi-weekly', 'Monthly', 'Yearly'])
    .withMessage('Invalid frequency')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const income = await Income.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income not found'
      });
    }

    res.json({
      success: true,
      message: 'Income updated successfully',
      data: { income }
    });
  } catch (error) {
    console.error('Income update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating income'
    });
  }
});

// @route   DELETE /api/savings/income/:id
// @desc    Delete income
// @access  Private
router.delete('/income/:id', protect, async (req, res) => {
  try {
    const income = await Income.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!income) {
      return res.status(404).json({
        success: false,
        message: 'Income not found'
      });
    }

    res.json({
      success: true,
      message: 'Income deleted successfully'
    });
  } catch (error) {
    console.error('Income deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting income'
    });
  }
});

// ==================== EXPENSES ROUTES ====================

// @route   POST /api/savings/expenses
// @desc    Add new savings expense
// @access  Private
router.post('/expenses', protect, [
  body('category')
    .isIn(['Rent', 'Electricity', 'Appliances', 'Food', 'Transport', 'Healthcare', 'Entertainment', 'Other'])
    .withMessage('Invalid expense category'),
  body('perMonth')
    .isFloat({ min: 0 })
    .withMessage('Monthly amount must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { category, perMonth } = req.body;

    const expense = await SavingsExpense.create({
      category,
      perMonth,
      user: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Expense added successfully',
      data: { expense }
    });
  } catch (error) {
    console.error('Expense creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding expense'
    });
  }
});

// @route   GET /api/savings/expenses
// @desc    Get all savings expenses for user
// @access  Private
router.get('/expenses', protect, async (req, res) => {
  try {
    const expenses = await SavingsExpense.find({
      user: req.user.id
    }).sort({ createdAt: -1 });

    const totalMonthlyExpenses = expenses.reduce((sum, expense) => sum + expense.perMonth, 0);
    const totalYearlyExpenses = expenses.reduce((sum, expense) => sum + expense.perYear, 0);

    res.json({
      success: true,
      data: {
        expenses,
        totalMonthlyExpenses,
        totalYearlyExpenses
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

// @route   PUT /api/savings/expenses/:id
// @desc    Update savings expense
// @access  Private
router.put('/expenses/:id', protect, [
  body('category')
    .optional()
    .isIn(['Rent', 'Electricity', 'Appliances', 'Food', 'Transport', 'Healthcare', 'Entertainment', 'Other'])
    .withMessage('Invalid expense category'),
  body('perMonth')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Monthly amount must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const expense = await SavingsExpense.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    res.json({
      success: true,
      message: 'Expense updated successfully',
      data: { expense }
    });
  } catch (error) {
    console.error('Expense update error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating expense'
    });
  }
});

// @route   DELETE /api/savings/expenses/:id
// @desc    Delete savings expense
// @access  Private
router.delete('/expenses/:id', protect, async (req, res) => {
  try {
    const expense = await SavingsExpense.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

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

// ==================== BUDGET ROUTES ====================

// @route   POST /api/savings/budget
// @desc    Set monthly budget
// @access  Private
router.post('/budget', protect, [
  body('monthlyBudget')
    .isFloat({ min: 0 })
    .withMessage('Monthly budget must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array()
      });
    }

    const { monthlyBudget } = req.body;

    // Check if user already has a budget
    let budget = await SavingsBudget.findOne({ user: req.user.id });

    if (budget) {
      // Update existing budget
      budget.monthlyBudget = monthlyBudget;
      await budget.save();
    } else {
      // Create new budget
      budget = await SavingsBudget.create({
        monthlyBudget,
        user: req.user.id
      });
    }

    res.json({
      success: true,
      message: 'Budget set successfully',
      data: { budget }
    });
  } catch (error) {
    console.error('Budget creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while setting budget'
    });
  }
});

// @route   GET /api/savings/budget
// @desc    Get monthly budget
// @access  Private
router.get('/budget', protect, async (req, res) => {
  try {
    const budget = await SavingsBudget.findOne({ user: req.user.id });

    res.json({
      success: true,
      data: { budget }
    });
  } catch (error) {
    console.error('Budget fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching budget'
    });
  }
});

// ==================== SUMMARY ROUTES ====================

// @route   GET /api/savings/summary
// @desc    Get savings plan summary
// @access  Private
router.get('/summary', protect, async (req, res) => {
  try {
    const [incomes, expenses, budget] = await Promise.all([
      Income.find({ user: req.user.id }),
      SavingsExpense.find({ user: req.user.id }),
      SavingsBudget.findOne({ user: req.user.id })
    ]);

    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
    const totalMonthlyExpenses = expenses.reduce((sum, expense) => sum + expense.perMonth, 0);
    const totalYearlyExpenses = expenses.reduce((sum, expense) => sum + expense.perYear, 0);
    const monthlyBudget = budget ? budget.monthlyBudget : 0;

    const monthlySavings = totalIncome - totalMonthlyExpenses;
    const yearlySavings = (totalIncome * 12) - totalYearlyExpenses;

    res.json({
      success: true,
      data: {
        income: {
          total: totalIncome,
          breakdown: incomes
        },
        expenses: {
          monthly: totalMonthlyExpenses,
          yearly: totalYearlyExpenses,
          breakdown: expenses
        },
        budget: {
          monthly: monthlyBudget
        },
        savings: {
          monthly: monthlySavings,
          yearly: yearlySavings
        }
      }
    });
  } catch (error) {
    console.error('Summary fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching summary'
    });
  }
});

export default router; 