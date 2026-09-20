require('dotenv').config();

const app = require('./src/app');

const PORT = parseInt(process.env.PORT || '5000', 10);

const server = app.listen(PORT, () => {
    console.log(`\n=============================================================`);
    console.log(`🚀 Kahaani Creative Agency Server Running!`);
    console.log(`🌐 Website URL : http://localhost:${PORT}`);
    console.log(`📡 API Endpoint: http://localhost:${PORT}/api/enquiries`);
    console.log(`💓 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`📋 Formspree   : ${process.env.FORMSPREE_URL || 'https://formspree.io/f/xrpbbnyv'}`);
    console.log(`=============================================================\n`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\n❌ Error: Port ${PORT} is already in use by another process.`);
        console.error(`👉 Run 'Stop-Process -Name node -Force' in PowerShell to clear it, or change PORT in .env (e.g. PORT=5001).\n`);
    } else {
        console.error('Server error:', err);
    }
});

// Handle uncaught terminations gracefully
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
        process.exit(0);
    });
});

