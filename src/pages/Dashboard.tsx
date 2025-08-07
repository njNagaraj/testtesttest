import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { CheckSquare, Receipt, TrendingUp, Calendar, DollarSign, Clock } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';

interface DashboardStats {
  todos: {
    total: number;
    completed: number;
    pending: number;
  };
  expenses: {
    total: number;
    weeklyTotal: number;
    monthlyTotal: number;
  };
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Fetch todos
        const todosResponse = await fetch('/api/todos', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const todosData = await todosResponse.json();
        
        // Fetch expense summary
        const expensesResponse = await fetch('/api/expenses/summary', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const expensesData = await expensesResponse.json();
        
        const dashboardStats: DashboardStats = {
          todos: {
            total: todosData.todos?.length || 0,
            completed: todosData.todos?.filter((t: any) => t.completed).length || 0,
            pending: todosData.todos?.filter((t: any) => !t.completed).length || 0,
          },
          expenses: {
            total: expensesData.summary?.totalExpenses || 0,
            weeklyTotal: expensesData.summary?.weeklyTotal || 0,
            monthlyTotal: expensesData.summary?.monthlyTotal || 0,
          }
        };
        
        setStats(dashboardStats);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.first_name}!
            </h1>
            <p className="text-gray-600 mt-1">
              Here's an overview of your tasks and expenses.
            </p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>Today</p>
            <p className="font-medium text-gray-900">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Todo Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <CheckSquare className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Tasks</span>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900">{stats?.todos.total || 0}</h3>
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-green-600">
                {stats?.todos.completed || 0} completed
              </span>
              <span className="text-orange-600">
                {stats?.todos.pending || 0} pending
              </span>
            </div>
          </div>
        </div>

        {/* Weekly Expenses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-teal-100 rounded-lg">
              <Calendar className="w-6 h-6 text-teal-600" />
            </div>
            <span className="text-sm text-gray-500">This Week</span>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900">
              ${stats?.expenses.weeklyTotal?.toFixed(2) || '0.00'}
            </h3>
            <p className="text-sm text-gray-600">Weekly expenses</p>
          </div>
        </div>

        {/* Monthly Expenses */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-orange-600" />
            </div>
            <span className="text-sm text-gray-500">This Month</span>
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900">
              ${stats?.expenses.monthlyTotal?.toFixed(2) || '0.00'}
            </h3>
            <p className="text-sm text-gray-600">Monthly expenses</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <a
              href="/todos"
              className="flex items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors group"
            >
              <CheckSquare className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Manage Todos</p>
                <p className="text-sm text-gray-600">Add, edit, or complete tasks</p>
              </div>
            </a>
            
            <a
              href="/expenses"
              className="flex items-center p-4 bg-teal-50 hover:bg-teal-100 rounded-lg transition-colors group"
            >
              <Receipt className="w-5 h-5 text-teal-600 mr-3" />
              <div>
                <p className="font-medium text-gray-900">Track Expenses</p>
                <p className="text-sm text-gray-600">Add new expenses and view analytics</p>
              </div>
            </a>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <Clock className="w-4 h-4 text-gray-400 mr-3" />
              <div className="text-sm">
                <p className="text-gray-900">Welcome to your new dashboard!</p>
                <p className="text-gray-500">Start by adding your first todo or expense</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;