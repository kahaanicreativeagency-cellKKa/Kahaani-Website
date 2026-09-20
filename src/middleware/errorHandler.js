/**
 * 404 Not Found handler for undefined API routes
 */
function notFoundHandler(req, res, next) {
    if (req.path.startsWith('/api')) {
        return res.status(404).json({
            success: false,
            message: `Route ${req.method} ${req.originalUrl} not found.`,
        });
    }
    next();
}

/**
 * Global error handling middleware
 */
function globalErrorHandler(err, req, res, next) {
    console.error('[ServerError]', err.stack || err.message);

    const statusCode = err.status || 500;
    res.status(statusCode).json({
        success: false,
        message: process.env.NODE_ENV === 'production' 
            ? 'An unexpected error occurred on the server. Please try again later.'
            : (err.message || 'Internal Server Error'),
    });
}

module.exports = {
    notFoundHandler,
    globalErrorHandler,
};

