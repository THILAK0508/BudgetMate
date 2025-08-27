import express from 'express';
import Budget from '../models/Budget.js';
import Expense from '../models/Expense.js';
import Subscription from '../models/Subscription.js';
import { Income, SavingsExpense, SavingsBudget } from '../models/SavingsPlan.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/dashboard/overview
// @desc    Get dashboard overview with all key metrics
// @access  Private
router.get('/overview', protect, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    // Calculate date range based on period
    const now = new Date();
    let startDate, endDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
        endDate = now;
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = now;
        break;
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = now;
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = now;
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = now;
    }

    // Fetch all data in parallel
    const [budgets, expenses, subscriptions, incomes, savingsExpenses, savingsBudget] = await Promise.all([
      Budget.find({ user: req.user.id, isActive: true }),
      Expense.find({ 
        user: req.user.id, 
        isActive: true,
        date: { $gte: startDate, $lte: endDate }
      }),
      Subscription.find({ user: req.user.id, isActive: true }),
      Income.find({ user: req.user.id }),
      SavingsExpense.find({ user: req.user.id }),
      SavingsBudget.findOne({ user: req.user.id })
    ]);

    // Calculate budget metrics
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
    const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
    const totalRemaining = budgets.reduce((sum, budget) => sum + budget.remaining, 0);
    const budgetCount = budgets.length;
    const budgetUtilization = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    // Calculate expense metrics
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const expenseCount = expenses.length;
    
    // Category-wise expense breakdown
    const categoryExpenses = {};
    expenses.forEach(expense => {
      if (!categoryExpenses[expense.category]) {
        categoryExpenses[expense.category] = 0;
      }
      categoryExpenses[expense.category] += expense.amount;
    });

    // Calculate subscription metrics
    const totalSubscriptionSpend = subscriptions.reduce((sum, sub) => sum + sub.totalSpend, 0);
    const subscriptionCount = subscriptions.length;
    const recurringSubscriptions = subscriptions.filter(sub => sub.recurringPayment === 'Yes').length;

    // Calculate savings metrics
    const totalIncome = incomes.reduce((sum, income) => sum + income.amount, 0);
    const totalMonthlyExpenses = savingsExpenses.reduce((sum, expense) => sum + expense.perMonth, 0);
    const totalYearlyExpenses = savingsExpenses.reduce((sum, expense) => sum + expense.perYear, 0);
    const monthlyBudget = savingsBudget ? savingsBudget.monthlyBudget : 0;
    const monthlySavings = totalIncome - totalMonthlyExpenses;
    const yearlySavings = (totalIncome * 12) - totalYearlyExpenses;

    // Recent activity (last 5 expenses)
    const recentExpenses = expenses
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map(expense => ({
        id: expense._id,
        name: expense.name,
        amount: expense.amount,
        category: expense.category,
        date: expense.date
      }));

    // Recent budgets (last 5 budgets)
    const recentBudgets = budgets
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
      .map(budget => ({
        id: budget._id,
        title: budget.title,
        amount: budget.amount,
        spent: budget.spent,
        remaining: budget.remaining,
        category: budget.category,
        icon: budget.icon,
        color: budget.color
      }));

    // Spending trends (last 6 months)
    const monthlyTrends = [];
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const monthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate >= month && expenseDate <= monthEnd;
      });
      
      monthlyTrends.push({
        month: month.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        amount: monthExpenses.reduce((sum, expense) => sum + expense.amount, 0),
        count: monthExpenses.length
      });
    }

    res.json({
      success: true,
      data: {
        period: {
          type: period,
          startDate,
          endDate
        },
        overview: {
          totalBudget,
          totalSpent,
          totalRemaining,
          budgetCount,
          budgetUtilization: Math.round(budgetUtilization),
          totalExpenses,
          expenseCount,
          totalSubscriptionSpend,
          subscriptionCount,
          recurringSubscriptions,
          totalIncome,
          totalMonthlyExpenses,
          totalYearlyExpenses,
          monthlyBudget,
          monthlySavings,
          yearlySavings
        },
        breakdowns: {
          categoryExpenses,
          monthlyTrends
        },
        recent: {
          expenses: recentExpenses,
          budgets: recentBudgets
        }
      }
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard overview'
    });
  }
});

// @route   GET /api/dashboard/quick-stats
// @desc    Get quick statistics for dashboard cards
// @access  Private
router.get('/quick-stats', protect, async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Fetch data for current month and year
    const [monthlyExpenses, yearlyExpenses, budgets, subscriptions] = await Promise.all([
      Expense.find({
        user: req.user.id,
        isActive: true,
        date: { $gte: startOfMonth }
      }),
      Expense.find({
        user: req.user.id,
        isActive: true,
        date: { $gte: startOfYear }
      }),
      Budget.find({ user: req.user.id, isActive: true }),
      Subscription.find({ user: req.user.id, isActive: true })
    ]);

    // Calculate quick stats
    const monthlySpending = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const yearlySpending = yearlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
    const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
    const budgetCount = budgets.length;
    const subscriptionCount = subscriptions.length;

    // Calculate month-over-month change
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    
    const lastMonthExpenses = await Expense.find({
      user: req.user.id,
      isActive: true,
      date: { $gte: lastMonth, $lte: lastMonthEnd }
    });
    
    const lastMonthSpending = lastMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const monthOverMonthChange = lastMonthSpending > 0 
      ? ((monthlySpending - lastMonthSpending) / lastMonthSpending) * 100 
      : 0;

    res.json({
      success: true,
      data: {
        currentMonth: {
          spending: monthlySpending,
          change: Math.round(monthOverMonthChange)
        },
        currentYear: {
          spending: yearlySpending
        },
        budget: {
          total: totalBudget,
          spent: totalSpent,
          remaining: totalBudget - totalSpent,
          count: budgetCount
        },
        subscriptions: {
          count: subscriptionCount
        }
      }
    });
  } catch (error) {
    console.error('Quick stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching quick stats'
    });
  }
});

// @route   GET /api/dashboard/activity-feed
// @desc    Get recent activity feed
// @access  Private
router.get('/activity-feed', protect, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    
    // Get recent expenses
    const recentExpenses = await Expense.find({
      user: req.user.id,
      isActive: true
    })
    .sort({ date: -1 })
    .limit(parseInt(limit))
    .populate('budget', 'title category');

    // Get recent budget updates
    const recentBudgets = await Budget.find({
      user: req.user.id,
      isActive: true
    })
    .sort({ updatedAt: -1 })
    .limit(parseInt(limit / 2));

    // Get recent subscriptions
    const recentSubscriptions = await Subscription.find({
      user: req.user.id,
      isActive: true
    })
    .sort({ createdAt: -1 })
    .limit(parseInt(limit / 2));

    // Combine and sort all activities
    const activities = [
      ...recentExpenses.map(expense => ({
        type: 'expense',
        id: expense._id,
        title: expense.name,
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
        budget: expense.budget ? expense.budget.title : null,
        action: 'added'
      })),
      ...recentBudgets.map(budget => ({
        type: 'budget',
        id: budget._id,
        title: budget.title,
        amount: budget.amount,
        category: budget.category,
        date: budget.updatedAt,
        action: 'updated'
      })),
      ...recentSubscriptions.map(subscription => ({
        type: 'subscription',
        id: subscription._id,
        title: subscription.name,
        amount: subscription.totalSpend,
        category: subscription.category,
        date: subscription.createdAt,
        action: 'added'
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: {
        activities,
        total: activities.length
      }
    });
  } catch (error) {
    console.error('Activity feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching activity feed'
    });
  }
});

// @route   GET /api/dashboard/notifications
// @desc    Get dashboard notifications and alerts
// @access  Private
router.get('/notifications', protect, async (req, res) => {
  try {
    const notifications = [];
    
    // Get budgets that are close to being exceeded
    const budgets = await Budget.find({ user: req.user.id, isActive: true });
    budgets.forEach(budget => {
      const utilization = (budget.spent / budget.amount) * 100;
      
      if (utilization >= 90) {
        notifications.push({
          type: 'warning',
          title: 'Budget Alert',
          message: `${budget.title} is ${utilization.toFixed(1)}% used. Consider reducing expenses.`,
          category: budget.category,
          data: { budgetId: budget._id, utilization: Math.round(utilization) }
        });
      } else if (utilization >= 80) {
        notifications.push({
          type: 'info',
          title: 'Budget Notice',
          message: `${budget.title} is ${utilization.toFixed(1)}% used.`,
          category: budget.category,
          data: { budgetId: budget._id, utilization: Math.round(utilization) }
        });
      }
    });

    // Get expenses that are unusually high
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const monthlyExpenses = await Expense.find({
      user: req.user.id,
      isActive: true,
      date: { $gte: startOfMonth }
    });

    const categoryExpenses = {};
    monthlyExpenses.forEach(expense => {
      if (!categoryExpenses[expense.category]) {
        categoryExpenses[expense.category] = [];
      }
      categoryExpenses[expense.category].push(expense.amount);
    });

    // Check for unusually high expenses in each category
    Object.entries(categoryExpenses).forEach(([category, amounts]) => {
      if (amounts.length > 0) {
        const avgAmount = amounts.reduce((sum, amount) => sum + amount, 0) / amounts.length;
        const maxAmount = Math.max(...amounts);
        
        if (maxAmount > avgAmount * 2) {
          notifications.push({
            type: 'info',
            title: 'High Expense Notice',
            message: `You have an unusually high expense in ${category} this month.`,
            category,
            data: { maxAmount, avgAmount: Math.round(avgAmount) }
          });
        }
      }
    });

    // Sort notifications by priority (warning > info)
    notifications.sort((a, b) => {
      const priority = { warning: 2, info: 1 };
      return priority[b.type] - priority[a.type];
    });

    res.json({
      success: true,
      data: {
        notifications,
        count: notifications.length,
        unreadCount: notifications.length // All notifications are considered unread for simplicity
      }
    });
  } catch (error) {
    console.error('Notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching notifications'
    });
  }
});

export default router; 