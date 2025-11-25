import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Public: Get all active slides
router.get('/', async (req, res) => {
    try {
        const slides = await prisma.slideImage.findMany({
            where: { isActive: true },
            orderBy: { order: 'asc' }
        });
        res.json(slides);
    } catch (error) {
        console.error('Error fetching slides:', error);
        res.status(500).json({ error: 'Failed to fetch slides' });
    }
});

// Protected: Upload a new slide
// Note: The actual file upload is handled by the /api/upload endpoint which returns a URL.
// This endpoint just saves the metadata.
router.post('/', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
    const { imageUrl, order } = req.body;
    try {
        const slide = await prisma.slideImage.create({
            data: {
                imageUrl,
                order: order || 0,
                isActive: true
            }
        });

        // Log action
        await prisma.auditLog.create({
            data: {
                action: 'CREATE',
                entity: 'SLIDE',
                details: `Added new slide: ${imageUrl}`,
                performedBy: (req as any).user.username || 'Unknown'
            }
        });

        res.json(slide);
    } catch (error) {
        console.error('Error creating slide:', error);
        res.status(500).json({ error: 'Failed to create slide' });
    }
});

// Protected: Delete a slide
router.delete('/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
    const { id } = req.params;
    try {
        const slide = await prisma.slideImage.delete({
            where: { id }
        });

        // Log action
        await prisma.auditLog.create({
            data: {
                action: 'DELETE',
                entity: 'SLIDE',
                details: `Deleted slide: ${slide.imageUrl}`,
                performedBy: (req as any).user.username || 'Unknown'
            }
        });

        res.json({ message: 'Slide deleted' });
    } catch (error) {
        console.error('Error deleting slide:', error);
        res.status(500).json({ error: 'Failed to delete slide' });
    }
});

// Protected: Update slide (e.g. order or active status)
router.put('/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
    const { id } = req.params;
    const { order, isActive } = req.body;
    try {
        const slide = await prisma.slideImage.update({
            where: { id },
            data: { order, isActive }
        });

        // Log action
        await prisma.auditLog.create({
            data: {
                action: 'UPDATE',
                entity: 'SLIDE',
                details: `Updated slide ${id}`,
                performedBy: (req as any).user.username || 'Unknown'
            }
        });

        res.json(slide);
    } catch (error) {
        console.error('Error updating slide:', error);
        res.status(500).json({ error: 'Failed to update slide' });
    }
});

export default router;
