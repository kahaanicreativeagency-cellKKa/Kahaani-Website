const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');

const enquiryRoutes = require('./routes/enquiryRoutes');
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler');

const app = express();

// 1. Security Headers
// contentSecurityPolicy is disabled to ensure Google Fonts and inline frontend styles load seamlessly
app.use(
    helmet({
        contentSecurityPolicy: false,
        crossOriginEmbedderPolicy: false,
    })
);

// 2. Cross-Origin Resource Sharing (CORS)
const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
app.use(
    cors({
        origin: allowedOrigin,
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Accept', 'Authorization'],
    })
);

// 3. Body Parsing Middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// 4. Serve Static Frontend Files (kahaani directory)
const frontendPath = path.join(__dirname, '../kahaani');
app.use(express.static(frontendPath));

// 5. Mount API Routes
app.use('/api', enquiryRoutes);

// 6. Root/Frontend fallback for single-page routing
app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

// 7. Error Handling Middleware
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;

