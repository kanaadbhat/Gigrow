import { body, query, param, validationResult } from 'express-validator';

// Validation middleware to check for errors
export const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors.array()
        });
    }
    next();
};

// Task creation validation
export const validateCreateTask = [
    body('title')
        .notEmpty()
        .withMessage('Title is required')
        .isLength({ min: 3, max: 100 })
        .withMessage('Title must be between 3 and 100 characters'),
    
    body('description')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters'),
    
    body('type')
        .isIn(['inperson', 'remote'])
        .withMessage('Type must be either "inperson" or "remote"'),
    
    body('urgency')
        .isIn(['low', 'medium', 'high'])
        .withMessage('Urgency must be "low", "medium", or "high"'),
    
    body('peopleRequired')
        .optional()
        .isInt({ min: 1 })
        .withMessage('People required must be at least 1'),
    
    body('skillsRequired')
        .optional()
        .isArray()
        .withMessage('Skills required must be an array'),
    
    body('skillsRequired.*.skill')
        .optional()
        .notEmpty()
        .withMessage('Skill name is required'),
    
    body('skillsRequired.*.count')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Skill count must be at least 1'),
    
    body('reward')
        .isNumeric()
        .withMessage('Reward must be a number')
        .custom((value) => value >= 0)
        .withMessage('Reward must be non-negative'),
    
    body('autoIncrement')
        .optional()
        .isBoolean()
        .withMessage('Auto increment must be a boolean'),
    
    body('maxCap')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Max cap must be non-negative'),
    
    body('location.address')
        .optional()
        .isLength({ max: 200 })
        .withMessage('Address cannot exceed 200 characters'),
    
    body('location.lat')
        .optional()
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be between -90 and 90'),
    
    body('location.lng')
        .optional()
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be between -180 and 180'),
    
    body('notes')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Notes cannot exceed 500 characters'),
    
    // Custom validation for autoIncrement and maxCap relationship
    body().custom((body) => {
        if (body.autoIncrement === true && (!body.maxCap || body.maxCap < body.reward)) {
            throw new Error('When autoIncrement is true, maxCap must be greater than or equal to reward');
        }
        return true;
    }),
    
    handleValidationErrors
];

// Task update validation (similar to create but all fields optional)
export const validateUpdateTask = [
    body('title')
        .optional()
        .notEmpty()
        .withMessage('Title cannot be empty')
        .isLength({ min: 3, max: 100 })
        .withMessage('Title must be between 3 and 100 characters'),
    
    body('description')
        .optional()
        .isLength({ max: 1000 })
        .withMessage('Description cannot exceed 1000 characters'),
    
    body('type')
        .optional()
        .isIn(['inperson', 'remote'])
        .withMessage('Type must be either "inperson" or "remote"'),
    
    body('urgency')
        .optional()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Urgency must be "low", "medium", or "high"'),
    
    body('peopleRequired')
        .optional()
        .isInt({ min: 1 })
        .withMessage('People required must be at least 1'),
    
    body('reward')
        .optional()
        .isNumeric()
        .withMessage('Reward must be a number')
        .custom((value) => value >= 0)
        .withMessage('Reward must be non-negative'),
    
    body('autoIncrement')
        .optional()
        .isBoolean()
        .withMessage('Auto increment must be a boolean'),
    
    body('maxCap')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Max cap must be non-negative'),
    
    body('notes')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Notes cannot exceed 500 characters'),
    
    handleValidationErrors
];

// Query parameter validation for listing tasks
export const validateTaskQuery = [
    query('status')
        .optional()
        .isIn(['open', 'assigned', 'completed', 'cancelled'])
        .withMessage('Status must be "open", "assigned", "completed", or "cancelled"'),
    
    query('type')
        .optional()
        .isIn(['inperson', 'remote'])
        .withMessage('Type must be either "inperson" or "remote"'),
    
    query('urgency')
        .optional()
        .isIn(['low', 'medium', 'high'])
        .withMessage('Urgency must be "low", "medium", or "high"'),
    
    query('q')
        .optional()
        .custom((value) => {
            // Allow empty string or strings between 1-100 characters
            if (value === '' || (value && value.length >= 1 && value.length <= 100)) {
                return true;
            }
            throw new Error('Search query must be empty or between 1 and 100 characters');
        }),
    
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100'),
    
    handleValidationErrors
];

// Param validation for task ID
export const validateTaskId = [
    param('id')
        .isMongoId()
        .withMessage('Invalid task ID format'),
    
    handleValidationErrors
];
