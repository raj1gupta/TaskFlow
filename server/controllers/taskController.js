const mongoose = require('mongoose');
const Task = require('../models/Task');

/**
 * @desc    Get all tasks for the logged in user with filters, search, and sorting
 * @route   GET /api/tasks
 * @access  Private
 */
const getTasks = async (req, res, next) => {
  try {
    const { status, priority, search, sortBy = 'createdAt', order = 'desc' } = req.query;

    const query = { user: req.user._id };

    // Filter by status if provided (and not 'All')
    if (status && status !== 'All') {
      query.status = status;
    }

    // Filter by priority if provided (and not 'All')
    if (priority && priority !== 'All') {
      query.priority = priority;
    }

    // Search query on title or description
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [{ title: searchRegex }, { description: searchRegex }];
    }

    // Construct sort options
    const sortField = ['dueDate', 'createdAt', 'title', 'priority', 'status'].includes(sortBy)
      ? sortBy
      : 'createdAt';
    const sortOrder = order === 'asc' ? 1 : -1;
    const sort = { [sortField]: sortOrder };

    const tasks = await Task.find(query).sort(sort);

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get aggregated task statistics for logged in user
 * @route   GET /api/tasks/stats/summary
 * @access  Private
 */
const getTaskStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    const tasks = await Task.find({ user: userId });

    const total = tasks.length;
    let pending = 0;
    let inProgress = 0;
    let completed = 0;
    let overdue = 0;

    tasks.forEach((task) => {
      if (task.status === 'Completed') {
        completed += 1;
      } else {
        if (task.status === 'Pending') pending += 1;
        if (task.status === 'In Progress') inProgress += 1;

        if (task.dueDate && new Date(task.dueDate) < now) {
          overdue += 1;
        }
      }
    });

    return res.status(200).json({
      success: true,
      stats: {
        total,
        pending,
        inProgress,
        completed,
        overdue,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single task by ID
 * @route   GET /api/tasks/:id
 * @access  Private
 */
const getTaskById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format.',
      });
    }

    const task = await Task.findOne({ _id: id, user: req.user._id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or access denied.',
      });
    }

    return res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Create a new task
 * @route   POST /api/tasks
 * @access  Private
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Task title is required.',
      });
    }

    const task = await Task.create({
      title: title.trim(),
      description: description ? description.trim() : '',
      status: status || 'Pending',
      priority: priority || 'Medium',
      dueDate: dueDate ? new Date(dueDate) : undefined,
      user: req.user._id,
    });

    return res.status(201).json({
      success: true,
      message: 'Task created successfully.',
      task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update an existing task
 * @route   PUT /api/tasks/:id
 * @access  Private
 */
const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format.',
      });
    }

    let task = await Task.findOne({ _id: id, user: req.user._id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized to update.',
      });
    }

    const { title, description, status, priority, dueDate } = req.body;

    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Task title cannot be empty.',
        });
      }
      task.title = title.trim();
    }

    if (description !== undefined) {
      task.description = description ? description.trim() : '';
    }

    if (status !== undefined) {
      if (!['Pending', 'In Progress', 'Completed'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status value.',
        });
      }
      task.status = status;
    }

    if (priority !== undefined) {
      if (!['Low', 'Medium', 'High'].includes(priority)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid priority value.',
        });
      }
      task.priority = priority;
    }

    if (dueDate !== undefined) {
      task.dueDate = dueDate ? new Date(dueDate) : null;
    }

    await task.save();

    return res.status(200).json({
      success: true,
      message: 'Task updated successfully.',
      task,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a task
 * @route   DELETE /api/tasks/:id
 * @access  Private
 */
const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid task ID format.',
      });
    }

    const task = await Task.findOneAndDelete({ _id: id, user: req.user._id });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found or unauthorized to delete.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Task deleted successfully.',
      deletedTaskId: id,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTasks,
  getTaskStats,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
};
