import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = Router();
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-prod';

router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log(`[LOGIN ATTEMPT] Username: ${username}`);

    try {
        const user = await prisma.user.findUnique({ where: { username } });
        if (!user) {
            console.log(`[LOGIN FAILED] User not found: ${username}`);
            // Use generic error message for security
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log(`[LOGIN DEBUG] User found: ${user.username}, Role: ${user.role}`);

        // Verify password
        let isValid = false;
        try {
            isValid = await bcrypt.compare(password, user.password);
        } catch (bcryptError) {
            console.error(`[LOGIN ERROR] Bcrypt compare failed for user ${username}:`, bcryptError);
            // Fallback for legacy plain text passwords (TEMPORARY - REMOVE IN PROD IF NOT NEEDED)
            if (password === user.password) {
                console.warn(`[LOGIN WARNING] User ${username} logged in with PLAIN TEXT password. Please reset password.`);
                isValid = true;
                // Optional: Auto-hash password here? No, let's keep it simple for now.
            }
        }

        if (!isValid) {
            console.log(`[LOGIN FAILED] Invalid password for user: ${username}`);
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log(`[LOGIN SUCCESS] User authenticated: ${username}`);

        const token = jwt.sign({ userId: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '1d' });

        // Log login
        try {
            await prisma.auditLog.create({
                data: {
                    action: 'LOGIN',
                    entity: 'USER',
                    details: `User ${user.username} logged in`,
                    performedBy: user.username
                }
            });
        } catch (auditError) {
            console.error('[LOGIN WARNING] Failed to create audit log:', auditError);
            // Don't fail the login just because audit log failed
        }

        // Set secure cookie only if using HTTPS
        // This allows login on http://192.168.x.x in production mode
        const isSecure = req.secure || req.headers['x-forwarded-proto'] === 'https';
        res.cookie('token', token, {
            httpOnly: true,
            secure: isSecure,
            sameSite: isSecure ? 'none' : 'lax'
        });

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
        console.error('[LOGIN CRITICAL ERROR] Full stack trace:', error);
        res.status(500).json({ error: 'Login failed', details: (error as Error).message });
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
