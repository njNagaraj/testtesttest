const todoController = {
  async getAllTodos(req, res) {
    try {
      const catalyst = req.catalyst;
      const datastore = catalyst.datastore();
      const todoTable = datastore.table('todos');
      const todos = await todoTable.getPagedRows();
      res.json({
        success: true,
        todos: todos.data,
      });
    } catch (error) {
      console.error('Get todos error:', error);
      res.status(500).json({
        error: 'Failed to fetch todos',
        details: error.message,
      });
    }
  },

  async createTodo(req, res) {
    try {
      const { title, description, priority = 'medium' } = req.body;
      const catalyst = req.catalyst;

      if (!title) {
        return res.status(400).json({
          error: 'Title is required',
        });
      }

      const datastore = catalyst.datastore();
      const todoTable = datastore.table('todos');

      const newTodo = {
        title,
        description: description || '',
        completed: false,
        priority,
      };

      const result = await todoTable.insertRow(newTodo);
      const createdTodo = Array.isArray(result) ? result[0] : result;

      res.status(201).json({
        success: true,
        todo: createdTodo,
        message: 'Todo created successfully',
      });
    } catch (error) {
      console.error('Create todo error:', error);
      res.status(500).json({
        error: 'Failed to create todo',
        details: error.message,
      });
    }
  },

  async updateTodo(req, res) {
    try {
      const { id } = req.params;
      const { title, description, completed, priority } = req.body;
      const catalyst = req.catalyst;

      const datastore = catalyst.datastore();
      const todoTable = datastore.table('todos');

      const updatedTodo = {
        ROWID: id,
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(completed !== undefined && { completed }),
        ...(priority && { priority }),
      };

      const result = await todoTable.updateRow(updatedTodo);
      const updatedResult = Array.isArray(result) ? result[0] : result;

      res.json({
        success: true,
        todo: updatedResult,
        message: 'Todo updated successfully',
      });
    } catch (error) {
      console.error('Update todo error:', error);
      res.status(500).json({
        error: 'Failed to update todo',
        details: error.message,
      });
    }
  },

  async deleteTodo(req, res) {
    try {
      const { id } = req.params;
      const catalyst = req.catalyst;
      const datastore = catalyst.datastore();
      const todoTable = datastore.table('todos');

      await todoTable.deleteRow(id);

      res.json({
        success: true,
        message: 'Todo deleted successfully',
      });
    } catch (error) {
      console.error('Delete todo error:', error);
      res.status(500).json({
        error: 'Failed to delete todo',
        details: error.message,
      });
    }
  },
};

export default todoController;