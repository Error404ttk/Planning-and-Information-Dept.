import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Protected: Get all users (Super Admin only)
router.get('/', authenticate, authorize(['SUPER_ADMIN']), async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, username: true, name: true, role: true, createdAt: true }
        });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Protected: Create user
router.post('/', authenticate, authorize(['SUPER_ADMIN']), async (req, res) => {
    const { username, password, name, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { username, password: hashedPassword, name, role }
        });

        await prisma.auditLog.create({
            data: {
                action: 'CREATE',
                entity: 'USER',
                details: `Created user: ${username}`,
                performedBy: (req as any).user.username || 'Unknown'
            }
        });

        res.json({ id: user.id, username: user.username, name: user.name, role: user.role });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Protected: Delete user
router.delete('/:id', authenticate, authorize(['SUPER_ADMIN']), async (req, res) => {
    const { id } = req.params;
    try {
        const user = await prisma.user.delete({ where: { id } });

        await prisma.auditLog.create({
            data: {
                action: 'DELETE',
                entity: 'USER',
                details: `Deleted user: ${user.username}`,
                performedBy: (req as any).user.username || 'Unknown'
            }
        });

        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

export default router;
