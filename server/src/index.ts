import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import authRoutes from './routes/auth';
import newsRoutes from './routes/news';
import userRoutes from './routes/users';
import path from 'path';
import uploadRoutes from './routes/upload';
import resourceRoutes from './routes/resources';

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

// Trust proxy - required when behind Nginx/Apache reverse proxy
app.set('trust proxy', true);

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

app.use('/api/', limiter);

// CORS configuration from environment
const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173'];
app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
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
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/resources', resourceRoutes);

app.get('/', (req, res) => {
    res.send('Saraphi Hospital API');
});

app.listen(PORT, () => {
    console.log(`✅ Server running on port ${PORT}`);
    console.log(`✅ CORS enabled for: ${allowedOrigins.join(', ')}`);
});
