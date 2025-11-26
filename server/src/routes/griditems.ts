import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Public: Get all grid items
router.get('/', async (req, res) => {
    try {
        const gridItems = await prisma.gridItem.findMany({
            orderBy: { order: 'asc' }
        });
        res.json(gridItems);
    } catch (error) {
        console.error('Error fetching grid items:', error);
        res.status(500).json({ error: 'Failed to fetch grid items' });
    }
});

// Protected: Update all grid items (bulk replace)
router.put('/', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
    const gridItemsData = req.body; // Array of GridItem objects

    try {
        // Delete all existing grid items
        await prisma.gridItem.deleteMany({});

        // Insert new grid items
        const createPromises = gridItemsData.map((item: any, index: number) => {
            return prisma.gridItem.create({
                data: {
                    iconName: item.iconName,
                    label: item.label,
                    description: item.description || null,
                    href: item.href,
                    order: index
                }
            });
        });

        await Promise.all(createPromises);

        // Log the action
        await prisma.auditLog.create({
            data: {
                action: 'UPDATE',
                entity: 'GRIDITEMS',
                details: `Updated grid items/services (${gridItemsData.length} items)`,
                performedBy: (req as any).user.username || 'Unknown'
            }
        });

        res.json({ success: true, count: gridItemsData.length });
    } catch (error) {
        console.error('Error updating grid items:', error);
        res.status(500).json({ error: 'Failed to update grid items' });
    }
});

export default router;
