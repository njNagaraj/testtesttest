import CatalystService from '../services/catalyst.js';

// Mock data for demo purposes
let expenses = [
  {
    id: '1',
    title: 'Lunch at restaurant',
    amount: 25.50,
    category: 'Food',
    date: new Date().toISOString(),
    description: 'Business lunch meeting',
    user_id: 'user_123'
  },
  {
    id: '2',
    title: 'Gas station',
    amount: 45.00,
    category: 'Transportation',
    date: new Date(Date.now() - 86400000).toISOString(),
    description: 'Weekly gas fill-up',
    user_id: 'user_123'
  },
  {
    id: '3',
    title: 'Office supplies',
    amount: 89.99,
    category: 'Office',
    date: new Date(Date.now() - 172800000).toISOString(),
    description: 'Notebooks and pens',
    user_id: 'user_123'
  },
  {
    id: '4',
    title: 'Coffee subscription',
    amount: 19.99,
    category: 'Food',
    date: new Date(Date.now() - 259200000).toISOString(),
    description: 'Monthly coffee delivery',
    user_id: 'user_123'
  }
];

const expenseController = {
  async getAllExpenses(req, res) {
    try {
      const userId = req.user.id;
      const { startDate, endDate, category } = req.query;
      
      let userExpenses = expenses.filter(expense => expense.user_id === userId);
      
      // Filter by date range if provided
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        userExpenses = userExpenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= start && expenseDate <= end;
        });
      }
      
      // Filter by category if provided
      if (category && category !== 'all') {
        userExpenses = userExpenses.filter(expense => expense.category === category);
      }
      
      // Sort by date (newest first)
      userExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
      
      res.json({
        success: true,
        expenses: userExpenses
      });
    } catch (error) {
      console.error('Get expenses error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch expenses', 
        details: error.message 
      });
    }
  },

  async createExpense(req, res) {
    try {
      const { title, amount, category, date, description } = req.body;
      const userId = req.user.id;

      if (!title || !amount || !category) {
        return res.status(400).json({ 
          error: 'Title, amount, and category are required' 
        });
      }

      if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({ 
          error: 'Amount must be a positive number' 
        });
      }

      const newExpense = {
        id: `expense_${Date.now()}`,
        title,
        amount: parseFloat(amount),
        category,
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
        description: description || '',
        user_id: userId,
        created_at: new Date().toISOString()
      };

      expenses.push(newExpense);

      res.status(201).json({
        success: true,
        expense: newExpense,
        message: 'Expense created successfully'
      });
    } catch (error) {
      console.error('Create expense error:', error);
      res.status(500).json({ 
        error: 'Failed to create expense', 
        details: error.message 
      });
    }
  },

  async updateExpense(req, res) {
    try {
      const { id } = req.params;
      const { title, amount, category, date, description } = req.body;
      const userId = req.user.id;

      const expenseIndex = expenses.findIndex(e => e.id === id && e.user_id === userId);
      
      if (expenseIndex === -1) {
        return res.status(404).json({ 
          error: 'Expense not found' 
        });
      }

      if (amount && (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0)) {
        return res.status(400).json({ 
          error: 'Amount must be a positive number' 
        });
      }

      const updatedExpense = {
        ...expenses[expenseIndex],
        ...(title && { title }),
        ...(amount && { amount: parseFloat(amount) }),
        ...(category && { category }),
        ...(date && { date: new Date(date).toISOString() }),
        ...(description !== undefined && { description }),
        updated_at: new Date().toISOString()
      };

      expenses[expenseIndex] = updatedExpense;

      res.json({
        success: true,
        expense: updatedExpense,
        message: 'Expense updated successfully'
      });
    } catch (error) {
      console.error('Update expense error:', error);
      res.status(500).json({ 
        error: 'Failed to update expense', 
        details: error.message 
      });
    }
  },

  async deleteExpense(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const expenseIndex = expenses.findIndex(e => e.id === id && e.user_id === userId);
      
      if (expenseIndex === -1) {
        return res.status(404).json({ 
          error: 'Expense not found' 
        });
      }

      expenses.splice(expenseIndex, 1);

      res.json({
        success: true,
        message: 'Expense deleted successfully'
      });
    } catch (error) {
      console.error('Delete expense error:', error);
      res.status(500).json({ 
        error: 'Failed to delete expense', 
        details: error.message 
      });
    }
  },

  async getExpenseSummary(req, res) {
    try {
      const userId = req.user.id;
      const userExpenses = expenses.filter(expense => expense.user_id === userId);
      
      const now = new Date();
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Weekly expenses
      const weeklyExpenses = userExpenses.filter(expense => 
        new Date(expense.date) >= startOfWeek
      );
      
      // Monthly expenses
      const monthlyExpenses = userExpenses.filter(expense => 
        new Date(expense.date) >= startOfMonth
      );
      
      // Category totals
      const categoryTotals = userExpenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {});
      
      // Weekly breakdown by day
      const weeklyBreakdown = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(date.getDate() + i);
        const dayExpenses = weeklyExpenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate.toDateString() === date.toDateString();
        });
        const total = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        weeklyBreakdown.push({
          date: date.toISOString().split('T')[0],
          total: Math.round(total * 100) / 100,
          count: dayExpenses.length
        });
      }
      
      // Monthly breakdown by week
      const monthlyBreakdown = [];
      const weeksInMonth = Math.ceil((now.getDate() + startOfMonth.getDay()) / 7);
      
      for (let week = 0; week < weeksInMonth; week++) {
        const weekStart = new Date(startOfMonth);
        weekStart.setDate(weekStart.getDate() + (week * 7) - startOfMonth.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        const weekExpenses = monthlyExpenses.filter(expense => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= weekStart && expenseDate <= weekEnd;
        });
        
        const total = weekExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        monthlyBreakdown.push({
          week: week + 1,
          startDate: weekStart.toISOString().split('T')[0],
          endDate: weekEnd.toISOString().split('T')[0],
          total: Math.round(total * 100) / 100,
          count: weekExpenses.length
        });
      }
      
      const summary = {
        totalExpenses: Math.round(userExpenses.reduce((sum, exp) => sum + exp.amount, 0) * 100) / 100,
        weeklyTotal: Math.round(weeklyExpenses.reduce((sum, exp) => sum + exp.amount, 0) * 100) / 100,
        monthlyTotal: Math.round(monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0) * 100) / 100,
        categoryTotals: Object.fromEntries(
          Object.entries(categoryTotals).map(([key, value]) => [key, Math.round(value * 100) / 100])
        ),
        weeklyBreakdown,
        monthlyBreakdown,
        totalCount: userExpenses.length,
        weeklyCount: weeklyExpenses.length,
        monthlyCount: monthlyExpenses.length
      };
      
      res.json({
        success: true,
        summary
      });
    } catch (error) {
      console.error('Get expense summary error:', error);
      res.status(500).json({ 
        error: 'Failed to get expense summary', 
        details: error.message 
      });
    }
  }
};

export default expenseController;