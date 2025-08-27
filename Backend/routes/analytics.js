import express from 'express';
import { body, validationResult } from 'express-validator';
import ExpenseAnalytics from '../models/ExpenseAnalytics.js';
import Expense from '../models/Expense.js';
import Budget from '../models/Budget.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   POST /api/analytics
// @desc    Create or update expense analytics
// @access  Private
router.post('/', protect, [
  body('category')
    .isIn(['Shopping', 'Food', 'Transport', 'Entertainment', 'Healthcare', 'Education', 'Home', 'Other'])
    .withMessage('Invalid category'),
  body('actual')
    .isFloat({ min: 0 })
    .withMessage('Actual amount must be a positive number'),
  body('budget')
    .isFloat({ min: 0 })
    .withMessage('Budget amount must be a positive number'),
  body('lastYear')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Last year amount must be a positive number'),
  body('description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('month')
    .isInt({ min: 1, max: 12 })
    .withMessage('Month must be between 1 and 12'),
  body('year')
    .isInt({ min: 2020 })
    .withMessage('Year must be 2020 or later')
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

    const { category, actual, budget, lastYear, description, month, year } = req.body;

    // Check if analytics already exists for this category, month, and year
    let analytics = await ExpenseAnalytics.findOne({
      user: req.user.id,
      category,
      month,
      year
    });

    if (analytics) {
      // Update existing analytics
      analytics.actual = actual;
      analytics.budget = budget;
      analytics.lastYear = lastYear || 0;
      analytics.description = description;
      await analytics.save();
    } else {
      // Create new analytics
      analytics = await ExpenseAnalytics.create({
        category,
        actual,
        budget,
        lastYear: lastYear || 0,
        description,
        month,
        year,
        user: req.user.id
      });
    }

    res.json({
      success: true,
      message: 'Analytics updated successfully',
      data: {
        analytics
      }
    });
  } catch (error) {
    console.error('Analytics creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating analytics'
    });
  }
});

// @route   GET /api/analytics
// @desc    Get expense analytics for a user
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { year, month, category } = req.query;
    
    const query = { user: req.user.id };
    
    if (year) {
      query.year = parseInt(year);
    }
    
    if (month) {
      query.month = parseInt(month);
    }
    
    if (category && category !== 'All') {
      query.category = category;
    }

    const analytics = await ExpenseAnalytics.find(query)
      .sort({ year: -1, month: -1, category: 1 });

    res.json({
      success: true,
      data: {
        analytics
      }
    });
  } catch (error) {
    console.error('Analytics fetch error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analytics'
    });
  }
});

// @route   GET /api/analytics/summary
// @desc    Get analytics summary
// @access  Private
router.get('/summary', protect, async (req, res) => {
  try {
    const { year } = req.query;
    const currentYear = year ? parseInt(year) : new Date().getFullYear();
    
    const analytics = await ExpenseAnalytics.find({
      user: req.user.id,
      year: currentYear
    });

    // Calculate summary statistics
    const totalBudget = analytics.reduce((sum, item) => sum + item.budget, 0);
    const totalActual = analytics.reduce((sum, item) => sum + item.actual, 0);
    const totalVariance = totalBudget - totalActual;
    const totalLastYear = analytics.reduce((sum, item) => sum + item.lastYear, 0);

    // Category-wise breakdown
    const categoryBreakdown = {};
    analytics.forEach(item => {
      if (!categoryBreakdown[item.category]) {
        categoryBreakdown[item.category] = {
          budget: 0,
          actual: 0,
          variance: 0,
          lastYear: 0,
          variancePercentage: 0
        };
      }
      categoryBreakdown[item.category].budget += item.budget;
      categoryBreakdown[item.category].actual += item.actual;
      categoryBreakdown[item.category].lastYear += item.lastYear;
    });

    // Calculate variance for each category
    Object.keys(categoryBreakdown).forEach(category => {
      const item = categoryBreakdown[category];
      item.variance = item.budget - item.actual;
      item.variancePercentage = item.budget > 0 ? Math.round((item.variance / item.budget) * 100) : 0;
    });

    // Monthly breakdown
    const monthlyBreakdown = {};
    for (let month = 1; month <= 12; month++) {
      monthlyBreakdown[month] = {
        budget: 0,
        actual: 0,
        variance: 0,
        lastYear: 0
      };
    }

    analytics.forEach(item => {
      monthlyBreakdown[item.month].budget += item.budget;
      monthlyBreakdown[item.month].actual += item.actual;
      monthlyBreakdown[item.month].lastYear += item.lastYear;
    });

    // Calculate variance for each month
    Object.keys(monthlyBreakdown).forEach(month => {
      const item = monthlyBreakdown[month];
      item.variance = item.budget - item.actual;
    });

    res.json({
      success: true,
      data: {
        year: currentYear,
        overview: {
          totalBudget,
          totalActual,
          totalVariance,
          totalLastYear,
          variancePercentage: totalBudget > 0 ? Math.round((totalVariance / totalBudget) * 100) : 0
        },
        categoryBreakdown,
        monthlyBreakdown
      }
    });
  } catch (error) {
    console.error('Analytics summary error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analytics summary'
    });
  }
});

// @route   GET /api/analytics/trends
// @desc    Get spending trends over time
// @access  Private
router.get('/trends', protect, async (req, res) => {
  try {
    const { years = 3 } = req.query;
    const currentYear = new Date().getFullYear();
    const startYear = currentYear - parseInt(years) + 1;
    
    const analytics = await ExpenseAnalytics.find({
      user: req.user.id,
      year: { $gte: startYear }
    }).sort({ year: 1, month: 1 });

    // Yearly trends
    const yearlyTrends = {};
    for (let year = startYear; year <= currentYear; year++) {
      yearlyTrends[year] = {
        totalBudget: 0,
        totalActual: 0,
        totalVariance: 0,
        totalLastYear: 0
      };
    }

    analytics.forEach(item => {
      yearlyTrends[item.year].totalBudget += item.budget;
      yearlyTrends[item.year].totalActual += item.actual;
      yearlyTrends[item.year].totalVariance += (item.budget - item.actual);
      yearlyTrends[item.year].totalLastYear += item.lastYear;
    });

    // Category trends over years
    const categoryTrends = {};
    analytics.forEach(item => {
      if (!categoryTrends[item.category]) {
        categoryTrends[item.category] = {};
      }
      if (!categoryTrends[item.category][item.year]) {
        categoryTrends[item.category][item.year] = {
          budget: 0,
          actual: 0,
          lastYear: 0
        };
      }
      categoryTrends[item.category][item.year].budget += item.budget;
      categoryTrends[item.category][item.year].actual += item.actual;
      categoryTrends[item.category][item.year].lastYear += item.lastYear;
    });

    res.json({
      success: true,
      data: {
        yearlyTrends,
        categoryTrends,
        period: {
          startYear,
          currentYear,
          years: parseInt(years)
        }
      }
    });
  } catch (error) {
    console.error('Analytics trends error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching trends'
    });
  }
});

// @route   GET /api/analytics/insights
// @desc    Get spending insights and recommendations
// @access  Private
router.get('/insights', protect, async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth() + 1;
    
    const [analytics, expenses, budgets] = await Promise.all([
      ExpenseAnalytics.find({
        user: req.user.id,
        year: currentYear
      }),
      Expense.find({
        user: req.user.id,
        isActive: true,
        date: {
          $gte: new Date(currentYear, 0, 1),
          $lt: new Date(currentYear, currentMonth, 1)
        }
      }),
      Budget.find({
        user: req.user.id,
        isActive: true
      })
    ]);

    const insights = [];

    // Budget vs Actual insights
    analytics.forEach(item => {
      const variancePercentage = item.budget > 0 ? (item.budget - item.actual) / item.budget * 100 : 0;
      
      if (variancePercentage > 20) {
        insights.push({
          type: 'warning',
          category: item.category,
          message: `You're spending ${Math.abs(variancePercentage).toFixed(1)}% less than budgeted in ${item.category}. Consider reallocating funds.`
        });
      } else if (variancePercentage < -20) {
        insights.push({
          type: 'alert',
          category: item.category,
          message: `You're spending ${Math.abs(variancePercentage).toFixed(1)}% more than budgeted in ${item.category}. Review your spending.`
        });
      }
    });

    // Spending pattern insights
    const categorySpending = {};
    expenses.forEach(expense => {
      if (!categorySpending[expense.category]) {
        categorySpending[expense.category] = 0;
      }
      categorySpending[expense.category] += expense.amount;
    });

    const totalSpent = Object.values(categorySpending).reduce((sum, amount) => sum + amount, 0);
    
    Object.entries(categorySpending).forEach(([category, amount]) => {
      const percentage = (amount / totalSpent) * 100;
      if (percentage > 40) {
        insights.push({
          type: 'info',
          category,
          message: `${category} accounts for ${percentage.toFixed(1)}% of your spending. Consider diversifying your expenses.`
        });
      }
    });

    // Budget utilization insights
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
    const totalSpentFromBudgets = budgets.reduce((sum, budget) => sum + budget.spent, 0);
    const budgetUtilization = totalBudget > 0 ? (totalSpentFromBudgets / totalBudget) * 100 : 0;

    if (budgetUtilization > 80) {
      insights.push({
        type: 'warning',
        category: 'Overall',
        message: `You've used ${budgetUtilization.toFixed(1)}% of your total budget. Monitor your spending closely.`
      });
    }

    res.json({
      success: true,
      data: {
        insights,
        summary: {
          totalBudget,
          totalSpent: totalSpentFromBudgets,
          budgetUtilization: Math.round(budgetUtilization),
          insightsCount: insights.length
        }
      }
    });
  } catch (error) {
    console.error('Analytics insights error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching insights'
    });
  }
});

export default router; 