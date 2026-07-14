"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const database_1 = require("./config/database");
const googleAuthRoutes_1 = __importDefault(require("./routes/googleAuthRoutes"));
// Import routes
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const doctorRoutes_1 = __importDefault(require("./routes/doctorRoutes"));
const appointmentRoutes_1 = __importDefault(require("./routes/appointmentRoutes"));
const paymentRoutes_1 = __importDefault(require("./routes/paymentRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
app.post('/api/payments/webhook', express_1.default.raw({ type: 'application/json' }));
// Middleware
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
app.use((0, cookie_parser_1.default)());
// CORS
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL,
    credentials: true,
}));
// Logging middleware
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});
// Root route
app.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Welcome to HealthHub API',
        documentation: '/api/health',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            doctors: '/api/doctors',
            appointments: '/api/appointments',
            users: '/api/users',
        },
    });
});
// Mount routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/doctors', doctorRoutes_1.default);
app.use('/api/appointments', appointmentRoutes_1.default);
app.use('/api/payments', paymentRoutes_1.default);
app.use('/api/users', userRoutes_1.default);
app.use('/api/auth/google', googleAuthRoutes_1.default);
// Health check
app.get('/api/health', (req, res) => {
    res.status(200).json({
        success: true,
        status: 'OK',
        message: 'HealthHub API is running',
        timestamp: new Date().toISOString(),
        endpoints: {
            auth: '/api/auth',
            doctors: '/api/doctors',
            appointments: '/api/appointments',
        },
    });
});
// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
});
// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: err.message || 'Internal server error',
    });
});
// Start server
const startServer = async () => {
    try {
        await database_1.db.connect();
        const PORT = process.env.PORT || 5000;
        const server = app.listen(PORT, () => {
            console.log('🚀 HealthHub Server Started');
            console.log(`📍 URL: http://localhost:${PORT}`);
        });
        // Graceful shutdown
        const gracefulShutdown = async () => {
            console.log('\n🔄 Shutting down gracefully...');
            server.close(async () => {
                await database_1.db.disconnect();
                console.log('✅ Server shutdown complete');
                process.exit(0);
            });
        };
        process.on('SIGINT', gracefulShutdown);
        process.on('SIGTERM', gracefulShutdown);
    }
    catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
exports.default = app;
