import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-prod';

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) {
            // Use generic error message for security
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

        // Log login
        await prisma.auditLog.create({
            data: {
                action: 'LOGIN',
                entity: 'USER',
                details: `User ${user.username} logged in`,
                performedBy: user.username
            }
        });

        res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        // Check if user must change password
        if (user.mustChangePassword) {
            return res.json({
                user: { id: user.id, username: user.username, name: user.name, role: user.role },
                mustChangePassword: true,
                message: 'You must change your password before continuing'
            });
        }

        res.json({ user: { id: user.id, username: user.username, name: user.name, role: user.role } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logged out' });
});

router.get('/me', async (req, res) => {
    const token = req.cookies.token;
    if (!token) return res.json({ user: null });

    try {
        const payload = jwt.verify(token, JWT_SECRET) as any;
        const user = await prisma.user.findUnique({ where: { id: payload.userId } });
        if (!user) return res.json({ user: null });

        res.json({ user: { id: user.id, username: user.username, name: user.name, role: user.role } });
    } catch (error) {
        console.error('Auth check error:', error);
        res.json({ user: null });
    }
});

export default router;
