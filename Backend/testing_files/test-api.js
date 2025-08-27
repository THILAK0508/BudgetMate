import fetch from 'node-fetch';

// Configuration
const BASE_URL = 'http://localhost:5000';
let AUTH_TOKEN = '';
let USER_ID = '';
let BUDGET_ID = '';
let EXPENSE_ID = '';
let SUBSCRIPTION_ID = '';

// Test data
const TEST_DATA = {
  user: {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  },
  budget: {
    title: 'Shopping Budget',
    amount: 1000,
    category: 'Shopping',
    icon: '🛍️',
    color: 'pink'
  },
  expense: {
    name: 'Grocery Shopping',
    amount: 150,
    category: 'Food',
    date: '2024-01-15',
    receipt: true,
    description: 'Weekly groceries from supermarket'
  },
  subscription: {
    name: 'Netflix Premium',
    plan: '₹799/month',
    totalSpend: 799,
    duration: '1 month',
    recurringPayment: 'Yes',
    category: 'Streaming',
    color: 'red'
  },
  income: {
    type: 'Salary',
    amount: 5000,
    frequency: 'Monthly'
  },
  savingsExpense: {
    category: 'Rent',
    perMonth: 1200
  }
};

// Utility functions
const log = (message, type = 'info') => {
  const colors = {
    info: '\x1b[36m',    // Cyan
    success: '\x1b[32m', // Green
    error: '\x1b[31m',   // Red
    warning: '\x1b[33m'  // Yellow
  };
  const reset = '\x1b[0m';
  console.log(`${colors[type]}${message}${reset}`);
};

const makeRequest = async (endpoint, options = {}) => {
  try {
    const url = `${BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...(AUTH_TOKEN && { 'Authorization': `Bearer ${AUTH_TOKEN}` }),
        ...options.headers
      },
      ...options
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${data.message || 'Unknown error'}`);
    }

    return { success: true, data, status: response.status };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Test functions
const testHealthCheck = async () => {
  log('\n🔍 Testing Health Check...', 'info');
  const result = await makeRequest('/api/health');
  
  if (result.success) {
    log('✅ Health check passed', 'success');
    return true;
  } else {
    log(`❌ Health check failed: ${result.error}`, 'error');
    return false;
  }
};

const testUserSignup = async () => {
  log('\n👤 Testing User Signup...', 'info');
  const result = await makeRequest('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(TEST_DATA.user)
  });

  if (result.success) {
    log('✅ User signup successful', 'success');
    return true;
  } else {
    log(`❌ User signup failed: ${result.error}`, 'error');
    return false;
  }
};

const testUserLogin = async () => {
  log('\n🔐 Testing User Login...', 'info');
  const result = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: TEST_DATA.user.email,
      password: TEST_DATA.user.password
    })
  });

  if (result.success) {
    AUTH_TOKEN = result.data.data.token;
    USER_ID = result.data.data.user.id;
    log('✅ User login successful', 'success');
    log(`🔑 Token: ${AUTH_TOKEN.substring(0, 20)}...`, 'info');
    return true;
  } else {
    log(`❌ User login failed: ${result.error}`, 'error');
    return false;
  }
};

const testCreateBudget = async () => {
  log('\n💰 Testing Budget Creation...', 'info');
  const result = await makeRequest('/api/budgets', {
    method: 'POST',
    body: JSON.stringify(TEST_DATA.budget)
  });

  if (result.success) {
    BUDGET_ID = result.data.data.budget._id;
    log('✅ Budget creation successful', 'success');
    log(`📊 Budget ID: ${BUDGET_ID}`, 'info');
    return true;
  } else {
    log(`❌ Budget creation failed: ${result.error}`, 'error');
    return false;
  }
};

const testCreateExpense = async () => {
  log('\n💸 Testing Expense Creation...', 'info');
  const result = await makeRequest('/api/expenses', {
    method: 'POST',
    body: JSON.stringify(TEST_DATA.expense)
  });

  if (result.success) {
    EXPENSE_ID = result.data.data.expense._id;
    log('✅ Expense creation successful', 'success');
    log(`📝 Expense ID: ${EXPENSE_ID}`, 'info');
    return true;
  } else {
    log(`❌ Expense creation failed: ${result.error}`, 'error');
    return false;
  }
};

const testCreateSubscription = async () => {
  log('\n📱 Testing Subscription Creation...', 'info');
  const result = await makeRequest('/api/subscriptions', {
    method: 'POST',
    body: JSON.stringify(TEST_DATA.subscription)
  });

  if (result.success) {
    SUBSCRIPTION_ID = result.data.data.subscription._id;
    log('✅ Subscription creation successful', 'success');
    log(`📱 Subscription ID: ${SUBSCRIPTION_ID}`, 'info');
    return true;
  } else {
    log(`❌ Subscription creation failed: ${result.error}`, 'error');
    return false;
  }
};

const testAddIncome = async () => {
  log('\n💵 Testing Income Addition...', 'info');
  const result = await makeRequest('/api/savings/income', {
    method: 'POST',
    body: JSON.stringify(TEST_DATA.income)
  });

  if (result.success) {
    log('✅ Income addition successful', 'success');
    return true;
  } else {
    log(`❌ Income addition failed: ${result.error}`, 'error');
    return false;
  }
};

const testAddSavingsExpense = async () => {
  log('\n🏠 Testing Savings Expense Addition...', 'info');
  const result = await makeRequest('/api/savings/expenses', {
    method: 'POST',
    body: JSON.stringify(TEST_DATA.savingsExpense)
  });

  if (result.success) {
    log('✅ Savings expense addition successful', 'success');
    return true;
  } else {
    log(`❌ Savings expense addition failed: ${result.error}`, 'error');
    return false;
  }
};

const testGetAllBudgets = async () => {
  log('\n📊 Testing Get All Budgets...', 'info');
  const result = await makeRequest('/api/budgets');

  if (result.success) {
    log('✅ Get all budgets successful', 'success');
    log(`📊 Found ${result.data.data.budgets.length} budgets`, 'info');
    return true;
  } else {
    log(`❌ Get all budgets failed: ${result.error}`, 'error');
    return false;
  }
};

const testGetAllExpenses = async () => {
  log('\n📝 Testing Get All Expenses...', 'info');
  const result = await makeRequest('/api/expenses');

  if (result.success) {
    log('✅ Get all expenses successful', 'success');
    log(`📝 Found ${result.data.data.expenses.length} expenses`, 'info');
    return true;
  } else {
    log(`❌ Get all expenses failed: ${result.error}`, 'error');
    return false;
  }
};

const testGetAllSubscriptions = async () => {
  log('\n📱 Testing Get All Subscriptions...', 'info');
  const result = await makeRequest('/api/subscriptions');

  if (result.success) {
    log('✅ Get all subscriptions successful', 'success');
    log(`📱 Found ${result.data.data.subscriptions.length} subscriptions`, 'info');
    return true;
  } else {
    log(`❌ Get all subscriptions failed: ${result.error}`, 'error');
    return false;
  }
};

const testGetDashboardOverview = async () => {
  log('\n📈 Testing Dashboard Overview...', 'info');
  const result = await makeRequest('/api/dashboard/overview');

  if (result.success) {
    log('✅ Dashboard overview successful', 'success');
    const overview = result.data.data.overview;
    log(`💰 Total Budget: ₹${overview.totalBudget}`, 'info');
    log(`💸 Total Spent: ₹${overview.totalSpent}`, 'info');
    log(`📊 Budget Count: ${overview.budgetCount}`, 'info');
    return true;
  } else {
    log(`❌ Dashboard overview failed: ${result.error}`, 'error');
    return false;
  }
};

const testGetQuickStats = async () => {
  log('\n⚡ Testing Quick Stats...', 'info');
  const result = await makeRequest('/api/dashboard/quick-stats');

  if (result.success) {
    log('✅ Quick stats successful', 'success');
    const stats = result.data.data;
    log(`📅 Current Month Spending: ₹${stats.currentMonth.spending}`, 'info');
    log(`📊 Budget Count: ${stats.budget.count}`, 'info');
    return true;
  } else {
    log(`❌ Quick stats failed: ${result.error}`, 'error');
    return false;
  }
};

const testGetActivityFeed = async () => {
  log('\n📋 Testing Activity Feed...', 'info');
  const result = await makeRequest('/api/dashboard/activity-feed');

  if (result.success) {
    log('✅ Activity feed successful', 'success');
    log(`📋 Found ${result.data.data.activities.length} activities`, 'info');
    return true;
  } else {
    log(`❌ Activity feed failed: ${result.error}`, 'error');
    return false;
  }
};

const testGetBudgetSummary = async () => {
  log('\n📊 Testing Budget Summary...', 'info');
  const result = await makeRequest('/api/budgets/summary/overview');

  if (result.success) {
    log('✅ Budget summary successful', 'success');
    const summary = result.data.data.overview;
    log(`💰 Total Budget: ₹${summary.totalBudget}`, 'info');
    log(`💸 Total Spent: ₹${summary.totalSpent}`, 'info');
    log(`📊 Budget Count: ${summary.budgetCount}`, 'info');
    return true;
  } else {
    log(`❌ Budget summary failed: ${result.error}`, 'error');
    return false;
  }
};

const testGetExpenseSummary = async () => {
  log('\n📝 Testing Expense Summary...', 'info');
  const result = await makeRequest('/api/expenses/summary/overview');

  if (result.success) {
    log('✅ Expense summary successful', 'success');
    const summary = result.data.data.overview;
    log(`💸 Total Spent: ₹${summary.totalSpent}`, 'info');
    log(`📝 Expense Count: ${summary.expenseCount}`, 'info');
    return true;
  } else {
    log(`❌ Expense summary failed: ${result.error}`, 'error');
    return false;
  }
};

const testGetSavingsSummary = async () => {
  log('\n💾 Testing Savings Summary...', 'info');
  const result = await makeRequest('/api/savings/summary');

  if (result.success) {
    log('✅ Savings summary successful', 'success');
    const summary = result.data.data;
    log(`💵 Total Income: ₹${summary.income.total}`, 'info');
    log(`🏠 Monthly Expenses: ₹${summary.expenses.monthly}`, 'info');
    log(`💾 Monthly Savings: ₹${summary.savings.monthly}`, 'info');
    return true;
  } else {
    log(`❌ Savings summary failed: ${result.error}`, 'error');
    return false;
  }
};

// Main test runner
const runAllTests = async () => {
  log('🚀 Starting Budget-Mate API Tests...', 'info');
  log('=' * 50, 'info');

  const tests = [
    { name: 'Health Check', fn: testHealthCheck },
    { name: 'User Signup', fn: testUserSignup },
    { name: 'User Login', fn: testUserLogin },
    { name: 'Create Budget', fn: testCreateBudget },
    { name: 'Create Expense', fn: testCreateExpense },
    { name: 'Create Subscription', fn: testCreateSubscription },
    { name: 'Add Income', fn: testAddIncome },
    { name: 'Add Savings Expense', fn: testAddSavingsExpense },
    { name: 'Get All Budgets', fn: testGetAllBudgets },
    { name: 'Get All Expenses', fn: testGetAllExpenses },
    { name: 'Get All Subscriptions', fn: testGetAllSubscriptions },
    { name: 'Dashboard Overview', fn: testGetDashboardOverview },
    { name: 'Quick Stats', fn: testGetQuickStats },
    { name: 'Activity Feed', fn: testGetActivityFeed },
    { name: 'Budget Summary', fn: testGetBudgetSummary },
    { name: 'Expense Summary', fn: testGetExpenseSummary },
    { name: 'Savings Summary', fn: testGetSavingsSummary }
  ];

  let passed = 0;
  let failed = 0;

  for (const test of tests) {
    try {
      const result = await test.fn();
      if (result) {
        passed++;
      } else {
        failed++;
      }
    } catch (error) {
      log(`❌ Test ${test.name} crashed: ${error.message}`, 'error');
      failed++;
    }
  }

  log('\n' + '=' * 50, 'info');
  log(`🎯 Test Results: ${passed} passed, ${failed} failed`, passed > failed ? 'success' : 'warning');
  
  if (failed === 0) {
    log('🎉 All tests passed! Your backend is working perfectly!', 'success');
  } else {
    log('⚠️  Some tests failed. Check the errors above.', 'warning');
  }
};

// Run tests if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runAllTests().catch(console.error);
}

export { runAllTests, makeRequest, TEST_DATA }; 