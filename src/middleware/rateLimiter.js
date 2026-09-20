const rateLimit = require('express-rate-limit');

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES || '15', 10) * 60 * 1000;
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '10', 10);

/**
 * Rate limiter specifically for enquiry submissions
 * Prevents automated form flooding / DDoS / spam
 */
const enquiryLimiter = rateLimit({
    windowMs: windowMs,
    max: maxRequests,
    standardHeaders: true, // Return rate limit info in RateLimit-* headers
    legacyHeaders: false, // Disable X-RateLimit-* headers
    message: {
        success: false,
        message: 'Too many enquiry submissions from this connection. Please wait a few minutes before trying again.',
    },
    statusCode: 429,
});

module.exports = {
    enquiryLimiter,
};

