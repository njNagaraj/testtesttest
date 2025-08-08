import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Calendar, DollarSign, TrendingUp, Filter, PieChart } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import api from '../api';

interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  date: string;
  description: string;
  created_at: string;
}

interface ExpenseSummary {
  totalExpenses: number;
  weeklyTotal: number;
  monthlyTotal: number;
  categoryTotals: Record<string, number>;
  weeklyBreakdown: Array<{
    date: string;
    total: number;
    count: number;
  }>;
  monthlyBreakdown: Array<{
    week: number;
    startDate: string;
    endDate: string;
    total: number;
    count: number;
  }>;
}

const CATEGORIES = [
  'Food', 'Transportation', 'Entertainment', 'Shopping',
  'Bills', 'Healthcare', 'Office', 'Travel', 'Other'
];

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [summary, setSummary] = useState<ExpenseSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [view, setView] = useState<'list' | 'weekly' | 'monthly'>('list');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Food',
    date: new Date().toISOString().split('T')[0],
    description: '',
  });

  const fetchExpenses = async () => {
    try {
      const [expensesResponse, summaryResponse] = await Promise.all([
        api.get('/expenses'),
        api.get('/expenses/summary'),
      ]);

      if (expensesResponse.data.success) {
        setExpenses(expensesResponse.data.expenses);
      }
      if (summaryResponse.data.success) {
        setSummary(summaryResponse.data.summary);
      }
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingExpense ? `/expenses/${editingExpense.id}` : '/expenses';
      const method = editingExpense ? 'put' : 'post';
      const { data } = await api[method](url, {
        ...formData,
        amount: parseFloat(formData.amount),
      });

      if (data.success) {
        await fetchExpenses();
        resetForm();
      }
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this expense?')) return;

    try {
      const { data } = await api.delete(`/expenses/${id}`);
      if (data.success) {
        await fetchExpenses();
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
    }
  };

  const startEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setFormData({
      title: expense.title,
      amount: expense.amount.toString(),
      category: expense.category,
      date: new Date(expense.date).toISOString().split('T')[0],
      description: expense.description,
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingExpense(null);
    setFormData({
      title: '',
      amount: '',
      category: 'Food',
      date: new Date().toISOString().split('T')[0],
      description: '',
    });
  };

  const filteredExpenses = expenses.filter(expense => {
    if (categoryFilter === 'all') return true;
    return expense.category === categoryFilter;
  });

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Food': 'bg-green-100 text-green-800',
      'Transportation': 'bg-blue-100 text-blue-800',
      'Entertainment': 'bg-purple-100 text-purple-800',
      'Shopping': 'bg-pink-100 text-pink-800',
      'Bills': 'bg-red-100 text-red-800',
      'Healthcare': 'bg-teal-100 text-teal-800',
      'Office': 'bg-gray-100 text-gray-800',
      'Travel': 'bg-indigo-100 text-indigo-800',
      'Other': 'bg-yellow-100 text-yellow-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Expense Tracker</h1>
          <p className="text-gray-600 mt-1">Track and analyze your spending</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Expense
        </button>
      </div>

      {/* Stats Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <DollarSign className="w-6 h-6 text-green-600" />
              <span className="text-sm text-gray-500">Total</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">${summary.totalExpenses.toFixed(2)}</p>
            <p className="text-sm text-gray-600">All time expenses</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <Calendar className="w-6 h-6 text-blue-600" />
              <span className="text-sm text-gray-500">This Week</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">${summary.weeklyTotal.toFixed(2)}</p>
            <p className="text-sm text-gray-600">Weekly spending</p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-6 h-6 text-orange-600" />
              <span className="text-sm text-gray-500">This Month</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">${summary.monthlyTotal.toFixed(2)}</p>
            <p className="text-sm text-gray-600">Monthly spending</p>
          </div>
        </div>
      )}

      {/* View Tabs and Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
          {/* View Tabs */}
          <div className="flex space-x-2">
            {(['list', 'weekly', 'monthly'] as const).map((viewOption) => (
              <button
                key={viewOption}
                onClick={() => setView(viewOption)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  view === viewOption
                    ? 'bg-teal-100 text-teal-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {viewOption.charAt(0).toUpperCase() + viewOption.slice(1)}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="all">All Categories</option>
              {CATEGORIES.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content based on view */}
      {view === 'list' && (
        <div className="space-y-4">
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
              <p className="text-gray-500">No expenses found.</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-2 text-teal-600 hover:text-teal-700"
              >
                Add your first expense
              </button>
            </div>
          ) : (
            filteredExpenses.map((expense) => (
              <div
                key={expense.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{expense.title}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-md ${getCategoryColor(expense.category)}`}>
                        {expense.category}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mb-2">${expense.amount.toFixed(2)}</p>
                    {expense.description && (
                      <p className="text-gray-600 mb-2">{expense.description}</p>
                    )}
                    <p className="text-sm text-gray-500">
                      {new Date(expense.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => startEdit(expense)}
                      className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-md transition-colors"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(expense.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Weekly View */}
      {view === 'weekly' && summary && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Weekly Breakdown</h2>
          <div className="space-y-3">
            {summary.weeklyBreakdown.map((day, index) => (
              <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">
                    {new Date(day.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-sm text-gray-500">{day.count} expenses</p>
                </div>
                <p className="text-lg font-semibold text-gray-900">${day.total.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Monthly View */}
      {view === 'monthly' && summary && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Breakdown by Week</h2>
            <div className="space-y-3">
              {summary.monthlyBreakdown.map((week) => (
                <div key={week.week} className="flex items-center justify-between py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-900">Week {week.week}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(week.startDate).toLocaleDateString()} - {new Date(week.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">{week.count} expenses</p>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">${week.total.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Breakdown</h2>
            <div className="space-y-3">
              {Object.entries(summary.categoryTotals)
                .sort(([,a], [,b]) => b - a)
                .map(([category, total]) => (
                <div key={category} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <span className={`px-2 py-1 text-xs font-medium rounded-md ${getCategoryColor(category)}`}>
                      {category}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900">${total.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Expense Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              {editingExpense ? 'Edit Expense' : 'Add New Expense'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Amount *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  >
                    {CATEGORIES.map((category) => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700 transition-colors"
                >
                  {editingExpense ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Expenses;