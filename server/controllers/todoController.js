import CatalystService from '../services/catalyst.js';

// Mock data for demo purposes
let todos = [
  {
    id: '1',
    title: 'Complete project setup',
    description: 'Set up the full-stack application with Catalyst',
    completed: false,
    priority: 'high',
    created_at: new Date().toISOString(),
    user_id: 'user_123'
  },
  {
    id: '2',
    title: 'Review documentation',
    description: 'Go through Catalyst SDK documentation',
    completed: true,
    priority: 'medium',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    user_id: 'user_123'
  }
];

const todoController = {
  async getAllTodos(req, res) {
    try {
      const userId = req.user.id;
      
      // In a real implementation, you would fetch from Catalyst Datastore
      // const catalystService = new CatalystService(req.context);
      // const userTodos = await catalystService.getRecords('todos', { userId });
      
      const userTodos = todos.filter(todo => todo.user_id === userId);
      
      res.json({
        success: true,
        todos: userTodos
      });
    } catch (error) {
      console.error('Get todos error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch todos', 
        details: error.message 
      });
    }
  },

  async createTodo(req, res) {
    try {
      const { title, description, priority = 'medium' } = req.body;
      const userId = req.user.id;

      if (!title) {
        return res.status(400).json({ 
          error: 'Title is required' 
        });
      }

      const newTodo = {
        id: `todo_${Date.now()}`,
        title,
        description: description || '',
        completed: false,
        priority,
        created_at: new Date().toISOString(),
        user_id: userId
      };

      // In a real implementation:
      // const catalystService = new CatalystService(req.context);
      // const result = await catalystService.insertRecord('todos', newTodo);
      
      todos.push(newTodo);

      res.status(201).json({
        success: true,
        todo: newTodo,
        message: 'Todo created successfully'
      });
    } catch (error) {
      console.error('Create todo error:', error);
      res.status(500).json({ 
        error: 'Failed to create todo', 
        details: error.message 
      });
    }
  },

  async updateTodo(req, res) {
    try {
      const { id } = req.params;
      const { title, description, completed, priority } = req.body;
      const userId = req.user.id;

      const todoIndex = todos.findIndex(t => t.id === id && t.user_id === userId);
      
      if (todoIndex === -1) {
        return res.status(404).json({ 
          error: 'Todo not found' 
        });
      }

      const updatedTodo = {
        ...todos[todoIndex],
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(completed !== undefined && { completed }),
        ...(priority && { priority }),
        updated_at: new Date().toISOString()
      };

      todos[todoIndex] = updatedTodo;

      res.json({
        success: true,
        todo: updatedTodo,
        message: 'Todo updated successfully'
      });
    } catch (error) {
      console.error('Update todo error:', error);
      res.status(500).json({ 
        error: 'Failed to update todo', 
        details: error.message 
      });
    }
  },

  async deleteTodo(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const todoIndex = todos.findIndex(t => t.id === id && t.user_id === userId);
      
      if (todoIndex === -1) {
        return res.status(404).json({ 
          error: 'Todo not found' 
        });
      }

      todos.splice(todoIndex, 1);

      res.json({
        success: true,
        message: 'Todo deleted successfully'
      });
    } catch (error) {
      console.error('Delete todo error:', error);
      res.status(500).json({ 
        error: 'Failed to delete todo', 
        details: error.message 
      });
    }
  }
};

export default todoController;