const express = require('express');
const router = express.Router();

const { handleCreateEnquiry, handleHealthCheck } = require('../controllers/enquiryController');
const { validateEnquiry } = require('../middleware/validator');
const { enquiryLimiter } = require('../middleware/rateLimiter');

// Health check endpoint
router.get('/health', handleHealthCheck);

// Contact enquiry submission endpoint
// Protected with rate limiting and server validation
router.post('/enquiries', enquiryLimiter, validateEnquiry, handleCreateEnquiry);

module.exports = router;

