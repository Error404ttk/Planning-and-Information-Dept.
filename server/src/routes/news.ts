import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Public: Get all news
router.get('/', async (req, res) => {
    try {
        const news = await prisma.newsArticle.findMany({ orderBy: { date: 'desc' } });
        res.json(news);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch news' });
    }
});

// Protected: Create news
router.post('/', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
    const { title, excerpt, content, imageUrl, date } = req.body;
    try {
        const news = await prisma.newsArticle.create({
            data: { title, excerpt, content, imageUrl, date }
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
        res.status(500).json({ error: 'Failed to create news' });
    }
});

// Protected: Update news
router.put('/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
    const { id } = req.params;
    const { title, excerpt, content, imageUrl, date } = req.body;
    try {
        const news = await prisma.newsArticle.update({
            where: { id },
            data: { title, excerpt, content, imageUrl, date }
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
