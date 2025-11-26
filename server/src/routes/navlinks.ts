import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Public: Get all navlinks
router.get('/', async (req, res) => {
    try {
        const navLinks = await prisma.navLink.findMany({
            orderBy: { order: 'asc' }
        });

        // Parse JSON data field and return as array
        const parsed = navLinks.map(link => JSON.parse(link.data));
        res.json(parsed);
    } catch (error) {
        console.error('Error fetching navlinks:', error);
        res.status(500).json({ error: 'Failed to fetch navigation links' });
    }
});

// Protected: Update all navlinks (bulk replace)
router.put('/', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
    const navLinksData = req.body; // Array of NavLink objects

    try {
        // Delete all existing navlinks
        await prisma.navLink.deleteMany({});

        // Insert new navlinks
        const createPromises = navLinksData.map((link: any, index: number) => {
            return prisma.navLink.create({
                data: {
                    name: link.name,
                    href: link.href,
                    order: index,
                    data: JSON.stringify(link) // Store entire structure as JSON
                }
            });
        });

        await Promise.all(createPromises);

        // Log the action
        await prisma.auditLog.create({
            data: {
                action: 'UPDATE',
                entity: 'NAVLINKS',
                details: `Updated navigation menu (${navLinksData.length} items)`,
                performedBy: (req as any).user.username || 'Unknown'
            }
        });

        res.json({ success: true, count: navLinksData.length });
    } catch (error) {
        console.error('Error updating navlinks:', error);
        res.status(500).json({ error: 'Failed to update navigation links' });
    }
});

export default router;
