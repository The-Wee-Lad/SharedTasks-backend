export const asyncHandler = 
    (func) => (req, res, next) => 
        Promise.response(func(req, res, next)).catch(err => next(err));