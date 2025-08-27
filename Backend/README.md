# Budget-Mate Backend API

A comprehensive backend API for the Budget-Mate application, built with Node.js, Express, and MongoDB.

## Features

- **User Authentication**: Secure JWT-based authentication with password hashing
- **Budget Management**: Create, read, update, and delete budgets with categories
- **Expense Tracking**: Comprehensive expense management with budget linking
- **Savings Planning**: Income tracking, expense planning, and budget setting
- **Subscription Management**: Track recurring subscriptions and payments
- **Analytics & Reporting**: Detailed spending analytics and insights
- **Dashboard**: Comprehensive overview with real-time statistics

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **Security**: Helmet, CORS
- **Logging**: Morgan

## Project Structure

```
Backend/
├── models/                 # Database models
│   ├── User.js            # User authentication model
│   ├── Budget.js          # Budget management model
│   ├── Expense.js         # Expense tracking model
│   ├── SavingsPlan.js     # Savings and income models
│   ├── Subscription.js    # Subscription management model
│   └── ExpenseAnalytics.js # Analytics and reporting model
├── routes/                 # API route handlers
│   ├── auth.js            # Authentication routes
│   ├── budget.js          # Budget management routes
│   ├── expense.js         # Expense management routes
│   ├── savings.js         # Savings planning routes
│   ├── subscription.js    # Subscription management routes
│   ├── analytics.js       # Analytics and reporting routes
│   └── dashboard.js       # Dashboard overview routes
├── middleware/             # Custom middleware
│   └── auth.js            # Authentication middleware
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── config.env             # Environment variables
└── README.md              # This file
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /signup` - User registration
- `POST /login` - User login
- `GET /profile` - Get user profile
- `PUT /profile` - Update user profile
- `POST /change-password` - Change password

### Budgets (`/api/budgets`)
- `POST /` - Create new budget
- `GET /` - Get all budgets (with pagination and filtering)
- `GET /:id` - Get specific budget
- `PUT /:id` - Update budget
- `DELETE /:id` - Delete budget (soft delete)
- `GET /summary/overview` - Get budget summary

### Expenses (`/api/expenses`)
- `POST /` - Create new expense
- `GET /` - Get all expenses (with pagination and filtering)
- `GET /:id` - Get specific expense
- `PUT /:id` - Update expense
- `DELETE /:id` - Delete expense (soft delete)
- `GET /summary/overview` - Get expense summary

### Savings (`/api/savings`)
- `POST /income` - Add income
- `GET /income` - Get all income
- `PUT /income/:id` - Update income
- `DELETE /income/:id` - Delete income
- `POST /expenses` - Add savings expense
- `GET /expenses` - Get all savings expenses
- `PUT /expenses/:id` - Update savings expense
- `DELETE /expenses/:id` - Delete savings expense
- `POST /budget` - Set monthly budget
- `GET /budget` - Get monthly budget
- `GET /summary` - Get savings plan summary

### Subscriptions (`/api/subscriptions`)
- `POST /` - Create new subscription
- `GET /` - Get all subscriptions (with pagination and filtering)
- `GET /:id` - Get specific subscription
- `PUT /:id` - Update subscription
- `DELETE /:id` - Delete subscription (soft delete)
- `GET /summary/overview` - Get subscription summary

### Analytics (`/api/analytics`)
- `POST /` - Create/update analytics
- `GET /` - Get analytics data
- `GET /summary` - Get analytics summary
- `GET /trends` - Get spending trends
- `GET /insights` - Get spending insights and recommendations

### Dashboard (`/api/dashboard`)
- `GET /overview` - Get comprehensive dashboard overview
- `GET /quick-stats` - Get quick statistics
- `GET /activity-feed` - Get recent activity feed
- `GET /notifications` - Get notifications and alerts

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Budget-Mate-main/Backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   # Copy the config.env file and update values
   cp config.env.example config.env
   ```
   
   Update the following variables in `config.env`:
   - `PORT`: Server port (default: 5000)
   - `MONGODB_URI`: MongoDB connection string
   - `JWT_SECRET`: Secret key for JWT tokens
   - `NODE_ENV`: Environment (development/production)

4. **Start MongoDB**
   Make sure MongoDB is running on your system or use MongoDB Atlas.

5. **Run the application**
   ```bash
   # Development mode with auto-reload
   npm run dev
   
   # Production mode
   npm start
   ```

## Database Models

### User
- `username`: Unique username
- `email`: Unique email address
- `password`: Hashed password
- `profilePicture`: Optional profile picture URL
- `isActive`: Account status

### Budget
- `title`: Budget title
- `amount`: Total budget amount
- `spent`: Amount spent
- `remaining`: Remaining amount (calculated)
- `category`: Budget category
- `icon`: Emoji or icon representation
- `color`: Color theme
- `user`: Reference to user

### Expense
- `name`: Expense name
- `amount`: Expense amount
- `date`: Expense date
- `category`: Expense category
- `receipt`: Receipt availability flag
- `description`: Optional description
- `budget`: Optional budget reference
- `user`: Reference to user

### Savings Plan
- **Income**: Type, amount, frequency
- **Expenses**: Category, monthly/yearly amounts
- **Budget**: Monthly budget setting

### Subscription
- `name`: Subscription name
- `plan`: Plan description
- `totalSpend`: Total amount spent
- `duration`: Subscription duration
- `recurringPayment`: Recurring payment flag
- `color`: Color theme
- `category`: Subscription category
- `nextPaymentDate`: Next payment date

### Expense Analytics
- `category`: Expense category
- `actual`: Actual spent amount
- `budget`: Budgeted amount
- `lastYear`: Last year's amount
- `month/year`: Time period
- Virtual fields for variance calculations

## API Response Format

All API responses follow a consistent format:

```json
{
  "success": true/false,
  "message": "Response message",
  "data": {
    // Response data
  },
  "errors": [
    // Validation errors (if any)
  ]
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Login/Signup**: Returns a JWT token
2. **Protected Routes**: Include token in Authorization header:
   ```
   Authorization: Bearer <your-jwt-token>
   ```

## Error Handling

- **400**: Bad Request (validation errors)
- **401**: Unauthorized (authentication required)
- **404**: Not Found (resource not found)
- **500**: Internal Server Error

## Validation

All input data is validated using express-validator:
- Required fields
- Data types and formats
- Business logic validation
- Custom validation rules

## Security Features

- **Password Hashing**: bcryptjs with salt rounds
- **JWT Security**: Secure token generation and validation
- **Input Validation**: Comprehensive input sanitization
- **CORS**: Cross-origin resource sharing configuration
- **Helmet**: Security headers middleware

## Development

### Running Tests
```bash
npm test
```

### Code Linting
```bash
npm run lint
```

### Environment Variables
- Development: `config.env`
- Production: Set environment variables in deployment platform

## Deployment

1. **Set production environment variables**
2. **Build the application**
3. **Deploy to your hosting platform**
4. **Ensure MongoDB connection is accessible**

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository. 