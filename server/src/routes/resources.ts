import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import fs from 'fs';
import path from 'path';

const router = Router();
const prisma = new PrismaClient();

// Public: Get all resources
router.get('/', async (req, res) => {
    try {
        const resources = await prisma.resource.findMany({ orderBy: { createdAt: 'desc' } });
        res.json(resources);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch resources' });
    }
});

// Public: Get resources by category
router.get('/category/:category', async (req, res) => {
    const { category } = req.params;
    try {
        const resources = await prisma.resource.findMany({
            where: { category },
            orderBy: { createdAt: 'desc' }
        });
        res.json(resources);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch resources' });
    }
});

// Protected: Create resource
router.post('/', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
    const { title, category, subcategory, fileUrl, fileType } = req.body;
    try {
        const resource = await prisma.resource.create({
            data: { title, category, subcategory, fileUrl, fileType }
        });

        await prisma.auditLog.create({
            data: {
                action: 'CREATE',
                entity: 'RESOURCE',
                details: `Created resource: ${title} in ${category}`,
                performedBy: (req as any).user.username || 'Unknown'
            }
        });

        res.json(resource);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create resource' });
    }
});

// Protected: Delete resource
router.delete('/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
    const { id } = req.params;
    try {
        const resource = await prisma.resource.findUnique({ where: { id } });
        if (!resource) {
            return res.status(404).json({ error: 'Resource not found' });
        }

        // Delete file from filesystem
        const filePath = path.join(__dirname, '../../uploads', path.basename(resource.fileUrl));
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        await prisma.resource.delete({ where: { id } });

        await prisma.auditLog.create({
            data: {
                action: 'DELETE_RESOURCE',
                entity: 'RESOURCE',
                details: `Deleted resource: ${resource.title}`,
                performedBy: (req as any).user.username || 'Admin'
            }
        });

        res.json({ message: 'Resource deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete resource' });
    }
});

// Protected: Update resource
router.put('/:id', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), async (req, res) => {
    const { id } = req.params;
    const { title, category, subcategory, fileUrl, fileType } = req.body;

    try {
        const existingResource = await prisma.resource.findUnique({ where: { id } });
        if (!existingResource) {
            return res.status(404).json({ error: 'Resource not found' });
        }

        // If a new file is uploaded (fileUrl is different), delete the old one
        if (fileUrl && fileUrl !== existingResource.fileUrl) {
            const oldFilePath = path.join(__dirname, '../../uploads', path.basename(existingResource.fileUrl));
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }

        const updatedResource = await prisma.resource.update({
            where: { id },
            data: {
                title,
                category,
                subcategory,
                // Only update file info if provided
                ...(fileUrl ? { fileUrl, fileType } : {})
            }
        });

        await prisma.auditLog.create({
            data: {
                action: 'UPDATE_RESOURCE',
                entity: 'RESOURCE',
                details: `Updated resource: ${title}`,
                performedBy: (req as any).user.username || 'Admin'
            }
        });

        res.json(updatedResource);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to update resource' });
    }
});

export default router;
