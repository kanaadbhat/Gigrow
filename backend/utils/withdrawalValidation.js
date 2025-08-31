// import { body, query, param, validationResult } from 'express-validator';

// // Validation middleware to check for errors
// export const handleValidationErrors = (req, res, next) => {
//     const errors = validationResult(req);
//     if (!errors.isEmpty()) {
//         return res.status(400).json({
//             success: false,
//             error: 'Validation failed',
//             details: errors.array()
//         });
//     }
//     next();
// };

// // Withdrawal request validation
// export const validateWithdrawalRequest = [
//     body('amount')
//         .isNumeric()
//         .withMessage('Amount must be a number')
//         .custom((value) => value > 0)
//         .withMessage('Amount must be greater than 0')
//         .custom((value) => value <= 10000)
//         .withMessage('Maximum withdrawal amount is 10,000 coins'),
    
//     body('feeBps')
//         .optional()
//         .isInt({ min: 0, max: 10000 })
//         .withMessage('Fee basis points must be between 0 and 10000 (0% to 100%)'),
    
//     handleValidationErrors
// ];

// // Withdrawal query validation
// export const validateWithdrawalQuery = [
//     query('status')
//         .optional()
//         .isIn(['pending', 'approved', 'rejected', 'paid'])
//         .withMessage('Status must be pending, approved, rejected, or paid'),
    
//     query('page')
//         .optional()
//         .isInt({ min: 1 })
//         .withMessage('Page must be a positive integer'),
    
//     query('limit')
//         .optional()
//         .isInt({ min: 1, max: 100 })
//         .withMessage('Limit must be between 1 and 100'),
    
//     handleValidationErrors
// ];

// // Settlement validation
// export const validateSettlement = [
//     body('action')
//         .isIn(['approve', 'reject'])
//         .withMessage('Action must be either "approve" or "reject"'),
    
//     body('reason')
//         .optional()
//         .isLength({ max: 500 })
//         .withMessage('Reason cannot exceed 500 characters'),
    
//     body('feeBps')
//         .optional()
//         .isInt({ min: 0, max: 10000 })
//         .withMessage('Fee basis points must be between 0 and 10000'),
    
//     handleValidationErrors
// ];

// // Withdrawal ID validation
// export const validateWithdrawalId = [
//     param('id')
//         .isMongoId()
//         .withMessage('Invalid withdrawal ID format'),
    
//     handleValidationErrors
// ];
