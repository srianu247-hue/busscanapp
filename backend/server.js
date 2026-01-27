import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes
import fingerprintRoutes from './routes/fingerprint.js';
import userRoutes from './routes/users.js';
import tripRoutes from './routes/trips.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// MIDDLEWARE
// ==========================================

// CORS configuration
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
    credentials: true
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});

// ==========================================
// DATABASE CONNECTION
// ==========================================

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('✅ Connected to MongoDB Atlas');
        console.log('📊 Database:', mongoose.connection.name);
    })
    .catch((error) => {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    });

// Handle MongoDB connection events
mongoose.connection.on('disconnected', () => {
    console.log('⚠️  MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
    console.error('❌ MongoDB error:', error);
});

// ==========================================
// ROUTES
// ==========================================

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        environment: process.env.NODE_ENV || 'development'
    });
});

// API routes
app.use('/api/fingerprint', fingerprintRoutes);
app.use('/api/users', userRoutes);
app.use('/api/trips', tripRoutes);

// Root route
app.get('/', (req, res) => {
    res.json({
        message: 'Bus Fingerprint Fare System API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            fingerprint: '/api/fingerprint/*',
            users: '/api/users/*',
            trips: '/api/trips/*'
        }
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        path: req.path
    });
});

// Error handler
app.use((error, req, res, next) => {
    console.error('❌ Server error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
});

// ==========================================
// START SERVER
// ==========================================

app.listen(PORT, () => {
    console.log('');
    console.log('🚌 ========================================');
    console.log('   Bus Fingerprint Fare System - Backend');
    console.log('   ========================================');
    console.log('');
    console.log(`   🚀 Server running on port ${PORT}`);
    console.log(`   🌐 URL: http://localhost:${PORT}`);
    console.log(`   📊 MongoDB: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Connecting...'}`);
    console.log(`   🔧 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log('');
    console.log('   Available endpoints:');
    console.log(`   • GET  /api/health`);
    console.log(`   • POST /api/fingerprint/verify`);
    console.log(`   • GET  /api/users/:userId`);
    console.log(`   • POST /api/users/:userId/deduct`);
    console.log(`   • POST /api/trips`);
    console.log('');
    console.log('   Press Ctrl+C to stop');
    console.log('========================================');
    console.log('');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n⏹️  Shutting down gracefully...');
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
    process.exit(0);
});
