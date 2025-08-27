# 🧪 Budget-Mate Backend Testing Guide

This guide provides comprehensive testing methods for your Budget-Mate backend API.

## 🚀 **Quick Start Testing**

### **Step 1: Start Your Backend**
```bash
cd Backend
npm install
npm run dev
```

### **Step 2: Test MongoDB Connection**
```bash
node test-connection.js
```

### **Step 3: Choose Your Testing Method**
- **Postman Collection** (Recommended for beginners)
- **Automated Test Script** (For comprehensive testing)
- **cURL Commands** (For quick manual testing)

---

## 📋 **Method 1: Postman Collection (Recommended)**

### **Import the Collection**
1. Open Postman
2. Click "Import" → "File" → Select `Budget-Mate-API.postman_collection.json`
3. Set environment variables:
   - `base_url`: `http://localhost:5000`
   - `auth_token`: Leave empty initially

### **Testing Flow**
1. **Health Check** → Should return 200 OK
2. **User Signup** → Creates test user
3. **User Login** → Returns JWT token
4. **Copy token** to `auth_token` variable
5. **Test all other endpoints** (they'll automatically use the token)

### **Expected Responses**
- **Signup**: 201 Created with user data and token
- **Login**: 200 OK with user data and token
- **Protected Routes**: 200 OK with requested data
- **Invalid Requests**: 400 Bad Request with validation errors

---

## 🤖 **Method 2: Automated Test Script**

### **Install Dependencies**
```bash
npm install node-fetch
```

### **Run All Tests**
```bash
node test-api.js
```

### **What It Tests**
- ✅ Health check
- ✅ User authentication (signup/login)
- ✅ Budget creation and retrieval
- ✅ Expense creation and retrieval
- ✅ Subscription management
- ✅ Savings planning
- ✅ Dashboard overview
- ✅ All summary endpoints

### **Test Data Used**
```json
{
  "user": {
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  },
  "budget": {
    "title": "Shopping Budget",
    "amount": 1000,
    "category": "Shopping",
    "icon": "🛍️",
    "color": "pink"
  },
  "expense": {
    "name": "Grocery Shopping",
    "amount": 150,
    "category": "Food",
    "date": "2024-01-15",
    "receipt": true,
    "description": "Weekly groceries from supermarket"
  }
}
```

---

## 🌐 **Method 3: cURL Commands**

### **Make Script Executable (Linux/Mac)**
```bash
chmod +x test-curl.sh
./test-curl.sh
```

### **Windows (PowerShell)**
```powershell
bash test-curl.sh
```

### **Manual cURL Testing**
```bash
# Health Check
curl http://localhost:5000/api/health

# User Signup
curl -X POST http://localhost:5000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"password123"}'

# User Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 📊 **Test Data Examples**

### **Budgets**
```json
[
  {
    "title": "Shopping Budget",
    "amount": 1000,
    "category": "Shopping",
    "icon": "🛍️",
    "color": "pink"
  },
  {
    "title": "Food Budget",
    "amount": 500,
    "category": "Food",
    "icon": "🍕",
    "color": "green"
  },
  {
    "title": "Transport Budget",
    "amount": 300,
    "category": "Transport",
    "icon": "🚗",
    "color": "blue"
  }
]
```

### **Expenses**
```json
[
  {
    "name": "Grocery Shopping",
    "amount": 150,
    "category": "Food",
    "date": "2024-01-15",
    "receipt": true,
    "description": "Weekly groceries from supermarket"
  },
  {
    "name": "Movie Tickets",
    "amount": 25,
    "category": "Entertainment",
    "date": "2024-01-14",
    "receipt": false
  },
  {
    "name": "Gas Station",
    "amount": 45,
    "category": "Transport",
    "date": "2024-01-13",
    "receipt": true
  },
  {
    "name": "Coffee Shop",
    "amount": 8,
    "category": "Food",
    "date": "2024-01-12",
    "receipt": false
  }
]
```

### **Subscriptions**
```json
[
  {
    "name": "Netflix Premium",
    "plan": "₹799/month",
    "totalSpend": 799,
    "duration": "1 month",
    "recurringPayment": "Yes",
    "category": "Streaming",
    "color": "red"
  },
  {
    "name": "Spotify Premium",
    "plan": "₹119/month",
    "totalSpend": 119,
    "duration": "1 month",
    "recurringPayment": "Yes",
    "category": "Music",
    "color": "green"
  },
  {
    "name": "Gym Membership",
    "plan": "₹1500/month",
    "totalSpend": 1500,
    "duration": "1 month",
    "recurringPayment": "Yes",
    "category": "Other",
    "color": "purple"
  }
]
```

### **Income Sources**
```json
[
  {
    "type": "Salary",
    "amount": 5000,
    "frequency": "Monthly"
  },
  {
    "type": "Freelance",
    "amount": 800,
    "frequency": "Monthly"
  },
  {
    "type": "Investment",
    "amount": 200,
    "frequency": "Monthly"
  }
]
```

### **Savings Expenses**
```json
[
  {
    "category": "Rent",
    "perMonth": 1200
  },
  {
    "category": "Electricity",
    "perMonth": 150
  },
  {
    "category": "Internet",
    "perMonth": 80
  },
  {
    "category": "Groceries",
    "perMonth": 400
  }
]
```

---

## 🔍 **Testing Checklist**

### **Authentication Tests**
- [ ] User signup with valid data
- [ ] User signup with invalid data (validation)
- [ ] User login with correct credentials
- [ ] User login with incorrect credentials
- [ ] Protected route access without token
- [ ] Protected route access with valid token

### **Budget Tests**
- [ ] Create budget with all fields
- [ ] Create budget with minimal fields
- [ ] Get all budgets
- [ ] Get budget by ID
- [ ] Update budget
- [ ] Delete budget
- [ ] Get budget summary

### **Expense Tests**
- [ ] Create expense with all fields
- [ ] Create expense linked to budget
- [ ] Get all expenses
- [ ] Filter expenses by category
- [ ] Filter expenses by date range
- [ ] Update expense
- [ ] Delete expense
- [ ] Get expense summary

### **Savings Tests**
- [ ] Add income source
- [ ] Add savings expense
- [ ] Set monthly budget
- [ ] Get savings summary
- [ ] Update income/expense
- [ ] Delete income/expense

### **Subscription Tests**
- [ ] Create subscription
- [ ] Get all subscriptions
- [ ] Filter by category
- [ ] Update subscription
- [ ] Delete subscription
- [ ] Get subscription summary

### **Dashboard Tests**
- [ ] Get overview with different periods
- [ ] Get quick stats
- [ ] Get activity feed
- [ ] Get notifications

---

## 🚨 **Common Issues & Solutions**

### **MongoDB Connection Failed**
```bash
# Check if MongoDB is running
mongod --version

# For local MongoDB
mongod

# For MongoDB Atlas, check connection string
# Make sure IP is whitelisted
```

### **Port Already in Use**
```bash
# Check what's using port 5000
netstat -ano | findstr :5000  # Windows
lsof -i :5000                 # Mac/Linux

# Kill the process or change port in config.env
```

### **JWT Token Issues**
```bash
# Check JWT_SECRET in config.env
# Make sure it's a strong secret
# Restart server after changing
```

### **Validation Errors**
- Check required fields
- Ensure data types are correct
- Verify enum values for categories
- Check date format (ISO 8601)

---

## 📈 **Performance Testing**

### **Load Testing with Artillery**
```bash
npm install -g artillery

# Create test scenario
artillery quick --count 100 --num 10 http://localhost:5000/api/health

# Test authenticated endpoints
artillery run load-test.yml
```

### **Load Test Configuration**
```yaml
# load-test.yml
config:
  target: 'http://localhost:5000'
  phases:
    - duration: 60
      arrivalRate: 10
  defaults:
    headers:
      Authorization: 'Bearer YOUR_TOKEN_HERE'

scenarios:
  - name: "API Load Test"
    requests:
      - get:
          url: "/api/budgets"
      - get:
          url: "/api/expenses"
      - get:
          url: "/api/dashboard/overview"
```

---

## 🎯 **Success Criteria**

Your backend is working correctly when:

1. **Health Check**: Returns 200 OK
2. **Authentication**: Signup/Login works, tokens are generated
3. **CRUD Operations**: Create, Read, Update, Delete work for all models
4. **Data Relationships**: Budgets link to expenses correctly
5. **Calculations**: Budget remaining amounts are accurate
6. **Validation**: Invalid data is rejected with proper error messages
7. **Authorization**: Protected routes require valid tokens
8. **Performance**: Responses are under 500ms for simple queries

---

## 🆘 **Getting Help**

### **Debug Mode**
```bash
# Enable detailed logging
NODE_ENV=development npm run dev
```

### **Check Logs**
- Server console output
- MongoDB logs
- Network tab in browser dev tools

### **Common HTTP Status Codes**
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error)
- **401**: Unauthorized (missing/invalid token)
- **404**: Not Found
- **500**: Internal Server Error

---

## 🎉 **Congratulations!**

Once all tests pass, your backend is ready for:
1. **Frontend Integration**
2. **Production Deployment**
3. **Additional Features**
4. **Performance Optimization**

Happy testing! 🚀 