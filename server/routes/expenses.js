import express from 'express';
import expenseController from '../controllers/expenseController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

router.get('/', expenseController.getAllExpenses);
router.post('/', expenseController.createExpense);
router.put('/:id', expenseController.updateExpense);
router.delete('/:id', expenseController.deleteExpense);
router.get('/summary', expenseController.getExpenseSummary);

export default router;