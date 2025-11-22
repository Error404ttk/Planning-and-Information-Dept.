import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/auth';

import newsRoutes from './routes/news';
import userRoutes from './routes/users';

import path from 'path';
import uploadRoutes from './routes/upload';
import resourceRoutes from './routes/resources';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
    origin: 'http://localhost:5173', // Vite default port
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.use('/api/auth', authRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/resources', resourceRoutes);

app.get('/', (req, res) => {
    res.send('Saraphi Hospital API');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
