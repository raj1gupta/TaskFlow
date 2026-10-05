const express = require('express');
const router = express.Router();
const {
  getTasks,
  getTaskStats,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const {
  validateCreateTask,
  validateUpdateTask,
  validateTaskId,
} = require('../middleware/validator');

// All task routes require JWT authentication
router.use(protect);

// Summary statistics endpoint
router.get('/stats/summary', getTaskStats);

// Task collection routes
router.route('/')
  .get(getTasks)
  .post(validateCreateTask, createTask);

// Single task routes
router.route('/:id')
  .get(validateTaskId, getTaskById)
  .put(validateUpdateTask, updateTask)
  .delete(validateTaskId, deleteTask);

module.exports = router;
