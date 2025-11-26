import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize } from '../middleware/auth';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();
const prisma = new PrismaClient();

// Configure multer for logo upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        // Use field name to create appropriate prefix
        const prefix = file.fieldname === 'aboutImage' ? 'about-image-' : 'hospital-logo-';
        cb(null, prefix + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

// GET /api/settings - Fetch all settings
router.get('/', async (req, res) => {
    try {
        const settings = await prisma.systemSetting.findMany();
        const settingsObj = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string>);
        res.json(settingsObj);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// POST /api/settings/logo - Upload hospital logo
router.post('/logo', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), upload.single('logo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No logo file uploaded' });
        }

        const logoUrl = `/uploads/${req.file.filename}`;

        // Upsert the setting
        await prisma.systemSetting.upsert({
            where: { key: 'hospitalLogo' },
            update: { value: logoUrl },
            create: { key: 'hospitalLogo', value: logoUrl }
        });

        res.json({ logoUrl, message: 'Logo updated successfully' });
    } catch (error) {
        console.error('Error uploading logo:', error);
        res.status(500).json({ error: 'Failed to upload logo' });
    }
});

// POST /api/settings/about-image - Upload About Us section image
router.post('/about-image', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), upload.single('aboutImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No about image file uploaded' });
        }

        const imageUrl = `/uploads/${req.file.filename}`;

        // Upsert the setting
        await prisma.systemSetting.upsert({
            where: { key: 'aboutImage' },
            update: { value: imageUrl },
            create: { key: 'aboutImage', value: imageUrl }
        });

        res.json({ imageUrl, message: 'About image updated successfully' });
    } catch (error) {
        console.error('Error uploading about image:', error);
        res.status(500).json({ error: 'Failed to upload about image' });
    }
});

export default router;

