import express from 'express';
import todoController from '../controllers/todoController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

router.get('/', todoController.getAllTodos);
router.post('/', todoController.createTodo);
router.put('/:id', todoController.updateTodo);
router.delete('/:id', todoController.deleteTodo);

export default router;