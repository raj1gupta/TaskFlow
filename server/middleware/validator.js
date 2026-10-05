const { body, param, query, validationResult } = require('express-validator');

// Result checker middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));

    return res.status(400).json({
      success: false,
      message: formattedErrors[0].message,
      errors: formattedErrors,
    });
  }
  next();
};

// Auth Validators
const validateSendOtp = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required.')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  handleValidationErrors,
];

const validateVerifyOtp = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required.')
    .isEmail()
    .withMessage('Please provide a valid email address.')
    .normalizeEmail(),
  body('otp')
    .trim()
    .notEmpty()
    .withMessage('Verification code is required.')
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be exactly 6 digits.')
    .isNumeric()
    .withMessage('OTP must contain only numbers.'),
  handleValidationErrors,
];

// Task Validators
const validateCreateTask = [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Task title is required.')
    .isLength({ max: 150 })
    .withMessage('Task title cannot exceed 150 characters.'),
  body('description')
    .optional({ checkFalsy: true })
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters.'),
  body('status')
    .optional()
    .isIn(['Pending', 'In Progress', 'Completed'])
    .withMessage("Status must be 'Pending', 'In Progress', or 'Completed'."),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage("Priority must be 'Low', 'Medium', or 'High'."),
  body('dueDate')
    .optional({ nullable: true, checkFalsy: true })
    .isISO8601()
    .withMessage('Due date must be a valid ISO8601 date string.'),
  handleValidationErrors,
];

const validateUpdateTask = [
  param('id')
    .isMongoId()
    .withMessage('Invalid task ID format.'),
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Task title cannot be empty.')
    .isLength({ max: 150 })
    .withMessage('Task title cannot exceed 150 characters.'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Description cannot exceed 2000 characters.'),
  body('status')
    .optional()
    .isIn(['Pending', 'In Progress', 'Completed'])
    .withMessage("Status must be 'Pending', 'In Progress', or 'Completed'."),
  body('priority')
    .optional()
    .isIn(['Low', 'Medium', 'High'])
    .withMessage("Priority must be 'Low', 'Medium', or 'High'."),
  body('dueDate')
    .optional({ nullable: true })
    .custom((val) => {
      if (val === null || val === '') return true;
      if (!Date.parse(val)) throw new Error('Invalid due date format');
      return true;
    }),
  handleValidationErrors,
];

const validateTaskId = [
  param('id')
    .isMongoId()
    .withMessage('Invalid task ID format.'),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  validateSendOtp,
  validateVerifyOtp,
  validateCreateTask,
  validateUpdateTask,
  validateTaskId,
};
