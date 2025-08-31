import { body, query, validationResult } from 'express-validator';

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

// Wallet order creation validation
export const validateCreateOrder = [
    body('amount')
        .isNumeric()
        .withMessage('Amount must be a number')
        .custom((value) => {
            if (value <= 0) {
                throw new Error('Amount must be greater than 0');
            }
            if (value > 100000) {
                throw new Error('Amount cannot exceed ₹1,00,000');
            }
            return true;
        }),
    
    handleValidationErrors
];

// Wallet info query validation
export const validateWalletQuery = [
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
