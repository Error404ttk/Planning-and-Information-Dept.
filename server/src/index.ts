import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth';
import slideRoutes from './routes/slides';
import newsRoutes from './routes/news';
import userRoutes from './routes/users';
import path from 'path';
import uploadRoutes from './routes/upload';
import resourceRoutes from './routes/resources';
import chatRoutes from './routes/chat';
// Settings routes
import settingsRoutes from './routes/settings';
import navlinksRoutes from './routes/navlinks';
import griditemsRoutes from './routes/griditems';

dotenv.config();

// Validate critical environment variables
const requiredEnvVars = ['JWT_SECRET', 'DATABASE_URL'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingEnvVars.join(', ')}`);
    console.error('Please set these variables in your .env file before starting the server.');
    process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3007;

// Trust proxy - Required when behind Nginx/Cloudflare
app.set('trust proxy', 1);

// Security headers
app.use(helmet());

// General rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 100 : 500, // Higher limit for development (React Strict Mode doubles requests)
    message: 'Too many requests from this IP, please try again later.'
});

// Stricter rate limiting for auth routes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 5 : 20, // Higher limit for development
    message: 'Too many login attempts, please try again later.'
});

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[REQUEST] ${req.method} ${req.url}`);
    next();
});

app.use('/api/', limiter);

// Disable caching for all API responses
app.use('/api/', (req, res, next) => {
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    next();
});


// CORS configuration from environment
const envOrigins = process.env.CORS_ORIGIN?.split(',') || [];
const defaultOrigins = ['http://localhost:5173', 'https://it.sarapeehospital.go.th'];
const allowedOrigins = [...new Set([...envOrigins, ...defaultOrigins])];

console.log('✅ Allowed CORS Origins:', allowedOrigins);
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.error(`❌ Blocked by CORS: ${origin}`);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
// Routes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/logout', authLimiter);
app.use('/api/auth', authRoutes); // Use general limiter for other auth routes (like /me)
app.use('/api/news', newsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/slides', slideRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/navlinks', navlinksRoutes);
app.use('/api/griditems', griditemsRoutes);


// Serve frontend static files (after building with 'npm run build')
// This allows running without Apache - just PM2
const frontendDistPath = path.join(__dirname, '../../dist');
app.use(express.static(frontendDistPath));

// SPA fallback - serve index.html for all non-API routes
// This enables client-side routing to work properly
app.use((req, res, next) => {
    // Don't serve index.html for API or uploads routes
    if (!req.path.startsWith('/api') && !req.path.startsWith('/uploads')) {
        res.sendFile(path.join(frontendDistPath, 'index.html'));
    } else {
        next();
    }
});



app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ CORS enabled for: ${allowedOrigins.join(', ')}`);
});
