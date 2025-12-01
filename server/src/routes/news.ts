import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Public: Get all news
router.get('/', async (req, res) => {
    try {
        const news = await prisma.newsArticle.findMany({
            orderBy: { date: 'desc' },
            include: { images: true }
        });
        res.json(news);
    } catch (error) {
        console.error('Error fetching news:', error);
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

// Protected: Create news
router.post('/', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
    const { title, excerpt, content, imageUrl, date, externalLink, images } = req.body;
    try {
        const news = await prisma.newsArticle.create({
            data: {
                title,
                excerpt,
                content,
                imageUrl,
                date,
                externalLink,
                images: {
                    create: images?.map((img: any) => ({ url: img.url || img })) || []
                }
            },
            include: { images: true }
        });

        // Log action
        await prisma.auditLog.create({
            data: {
                action: 'CREATE',
                entity: 'NEWS',
                details: `Created news: ${title}`,
                performedBy: (req as any).user.username || 'Unknown'
            }
        });

        res.json(news);
    } catch (error) {
        console.error('Error creating news:', error);
        res.status(500).json({ error: 'Failed to create news' });
    }
});

// Protected: Update news
router.put('/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
    const { id } = req.params;
    const { title, excerpt, content, imageUrl, date, externalLink, images } = req.body;
    try {
        // First delete existing images if we are replacing them (simplest approach for now)
        // Or better: we receive the full list of desired images. 
        // For simplicity in this iteration: 
        // 1. We'll delete all existing images for this news
        // 2. Create new ones from the provided array
        // This is not the most efficient but robust for "syncing" state

        if (images) {
            await prisma.newsImage.deleteMany({ where: { newsId: id } });
        }

        const news = await prisma.newsArticle.update({
            where: { id },
            data: {
                title,
                excerpt,
                content,
                imageUrl,
                date,
                externalLink,
                images: images ? {
                    create: images.map((img: any) => ({ url: img.url || img }))
                } : undefined
            },
            include: { images: true }
        });

        await prisma.auditLog.create({
            data: {
                action: 'UPDATE',
                entity: 'NEWS',
                details: `Updated news: ${title}`,
                performedBy: (req as any).user.username || 'Unknown'
            }
        });

        res.json(news);
    } catch (error) {
        console.error('Error updating news:', error);
        res.status(500).json({ error: 'Failed to update news' });
    }
});

// Protected: Delete news
router.delete('/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
    const { id } = req.params;
    try {
        const news = await prisma.newsArticle.delete({ where: { id } });

        await prisma.auditLog.create({
            data: {
                action: 'DELETE',
                entity: 'NEWS',
                details: `Deleted news: ${news.title}`,
                performedBy: (req as any).user.username || 'Unknown'
            }
        });

        res.json({ message: 'News deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete news' });
    }
});

export default router;
