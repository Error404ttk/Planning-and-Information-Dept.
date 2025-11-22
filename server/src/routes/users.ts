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

// Protected: Update user (Super Admin only - can change role and name)
router.put('/:id', authenticate, authorize(['SUPER_ADMIN']), async (req, res) => {
    const { id } = req.params;
    const { name, role } = req.body;

    try {
        // Prevent changing own role
        if (id === (req as any).user.userId) {
            return res.status(403).json({ error: 'Cannot change your own role' });
        }

        const user = await prisma.user.update({
            where: { id },
            data: { name, role },
            select: { id: true, username: true, name: true, role: true }
        });

        await prisma.auditLog.create({
            data: {
                action: 'UPDATE',
                entity: 'USER',
                details: `Updated user: ${user.username} (role: ${role})`,
                performedBy: (req as any).user.username || 'Unknown'
            }
        });

        res.json(user);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Protected: Change own password (any authenticated user)
router.patch('/me/password', authenticate, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = (req as any).user.userId;

    try {
        // Verify current password
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // If user must change password (first login), skip current password check
        if (!user.mustChangePassword) {
            const isValid = await bcrypt.compare(currentPassword, user.password);
            if (!isValid) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }
        }

        // Update password and clear mustChangePassword flag
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
                mustChangePassword: false // Clear the flag after password change
            }
        });

        await prisma.auditLog.create({
            data: {
                action: 'UPDATE',
                entity: 'USER',
                details: `User ${user.username} changed their password`,
                performedBy: user.username
            }
        });

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to change password' });
    }
});

// Protected: Reset user password (Super Admin only)
router.patch('/:id/password', authenticate, authorize(['SUPER_ADMIN']), async (req, res) => {
    const { id } = req.params;
    const { newPassword } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { id } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id },
            data: { password: hashedPassword }
        });

        await prisma.auditLog.create({
            data: {
                action: 'UPDATE',
                entity: 'USER',
                details: `Admin reset password for user: ${user.username}`,
                performedBy: (req as any).user.username || 'Unknown'
            }
        });

        res.json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to reset password' });
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
