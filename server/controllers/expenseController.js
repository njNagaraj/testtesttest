const expenseController = {
  async getAllExpenses(req, res) {
    try {
      const catalyst = req.catalyst;
      const datastore = catalyst.datastore();
      const expenseTable = datastore.table('expenses');
      const expenses = await expenseTable.getPagedRows();
      res.json({
        success: true,
        expenses: expenses.data,
      });
    } catch (error) {
      console.error('Get expenses error:', error);
      res.status(500).json({
        error: 'Failed to fetch expenses',
        details: error.message,
      });
    }
  },

  async createExpense(req, res) {
    try {
      const { title, amount, category, date, description } = req.body;
      const catalyst = req.catalyst;

      if (!title || !amount || !category) {
        return res.status(400).json({
          error: 'Title, amount, and category are required',
        });
      }

      if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
        return res.status(400).json({
          error: 'Amount must be a positive number',
        });
      }

      const datastore = catalyst.datastore();
      const expenseTable = datastore.table('expenses');

      const newExpense = {
        title,
        amount: parseFloat(amount),
        category,
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
        description: description || '',
      };

      const result = await expenseTable.insertRow(newExpense);
      const createdExpense = Array.isArray(result) ? result[0] : result;

      res.status(201).json({
        success: true,
        expense: createdExpense,
        message: 'Expense created successfully',
      });
    } catch (error) {
      console.error('Create expense error:', error);
      res.status(500).json({
        error: 'Failed to create expense',
        details: error.message,
      });
    }
  },

  async updateExpense(req, res) {
    try {
      const { id } = req.params;
      const { title, amount, category, date, description } = req.body;
      const catalyst = req.catalyst;

      if (amount && (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0)) {
        return res.status(400).json({
          error: 'Amount must be a positive number',
        });
      }

      const datastore = catalyst.datastore();
      const expenseTable = datastore.table('expenses');

      const updatedExpense = {
        ROWID: id,
        ...(title && { title }),
        ...(amount && { amount: parseFloat(amount) }),
        ...(category && { category }),
        ...(date && { date: new Date(date).toISOString() }),
        ...(description !== undefined && { description }),
      };

      const result = await expenseTable.updateRow(updatedExpense);
      const updatedResult = Array.isArray(result) ? result[0] : result;

      res.json({
        success: true,
        expense: updatedResult,
        message: 'Expense updated successfully',
      });
    } catch (error) {
      console.error('Update expense error:', error);
      res.status(500).json({
        error: 'Failed to update expense',
        details: error.message,
      });
    }
  },

  async deleteExpense(req, res) {
    try {
      const { id } = req.params;
      const catalyst = req.catalyst;
      const datastore = catalyst.datastore();
      const expenseTable = datastore.table('expenses');

      await expenseTable.deleteRow(id);

      res.json({
        success: true,
        message: 'Expense deleted successfully',
      });
    } catch (error) {
      console.error('Delete expense error:', error);
      res.status(500).json({
        error: 'Failed to delete expense',
        details: error.message,
      });
    }
  },

  async getExpenseSummary(req, res) {
    try {
      const catalyst = req.catalyst;
      const datastore = catalyst.datastore();
      const expenseTable = datastore.table('expenses');
      const expenses = (await expenseTable.getPagedRows()).data;

      const now = new Date();
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - now.getDay());
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const weeklyExpenses = expenses.filter(
        (expense) => new Date(expense.date) >= startOfWeek
      );
      const monthlyExpenses = expenses.filter(
        (expense) => new Date(expense.date) >= startOfMonth
      );

      const categoryTotals = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
      }, {});

      const weeklyBreakdown = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(startOfWeek);
        date.setDate(date.getDate() + i);
        const dayExpenses = weeklyExpenses.filter((expense) => {
          const expenseDate = new Date(expense.date);
          return expenseDate.toDateString() === date.toDateString();
        });
        const total = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        weeklyBreakdown.push({
          date: date.toISOString().split('T')[0],
          total: Math.round(total * 100) / 100,
          count: dayExpenses.length,
        });
      }

      const monthlyBreakdown = [];
      const weeksInMonth = Math.ceil((now.getDate() + startOfMonth.getDay()) / 7);

      for (let week = 0; week < weeksInMonth; week++) {
        const weekStart = new Date(startOfMonth);
        weekStart.setDate(weekStart.getDate() + week * 7 - startOfMonth.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        const weekExpenses = monthlyExpenses.filter((expense) => {
          const expenseDate = new Date(expense.date);
          return expenseDate >= weekStart && expenseDate <= weekEnd;
        });

        const total = weekExpenses.reduce((sum, exp) => sum + exp.amount, 0);
        monthlyBreakdown.push({
          week: week + 1,
          startDate: weekStart.toISOString().split('T')[0],
          endDate: weekEnd.toISOString().split('T')[0],
          total: Math.round(total * 100) / 100,
          count: weekExpenses.length,
        });
      }

      const summary = {
        totalExpenses: Math.round(
          expenses.reduce((sum, exp) => sum + exp.amount, 0) * 100
        ) / 100,
        weeklyTotal: Math.round(
          weeklyExpenses.reduce((sum, exp) => sum + exp.amount, 0) * 100
        ) / 100,
        monthlyTotal: Math.round(
          monthlyExpenses.reduce((sum, exp) => sum + exp.amount, 0) * 100
        ) / 100,
        categoryTotals: Object.fromEntries(
          Object.entries(categoryTotals).map(([key, value]) => [
            key,
            Math.round(value * 100) / 100,
          ])
        ),
        weeklyBreakdown,
        monthlyBreakdown,
        totalCount: expenses.length,
        weeklyCount: weeklyExpenses.length,
        monthlyCount: monthlyExpenses.length,
      };

      res.json({
        success: true,
        summary,
      });
    } catch (error) {
      console.error('Get expense summary error:', error);
      res.status(500).json({
        error: 'Failed to get expense summary',
        details: error.message,
      });
    }
  },
};

export default expenseController;