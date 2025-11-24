import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

// Configure storage
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
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        // Allowed file extensions
        const allowedExtensions = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx/;
        const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());

        // Allowed mimetypes
        const allowedMimetypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/gif',
            'application/pdf',
            'application/msword', // .doc
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
            'application/vnd.ms-excel', // .xls
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
        ];

        const mimetypeAllowed = allowedMimetypes.includes(file.mimetype);

        if (extname && mimetypeAllowed) {
            return cb(null, true);
        } else {
            cb(new Error('Error: File type not allowed!'));
        }
    }
});

// Protected: Upload file
router.post('/', authenticate, authorize(['ADMIN', 'SUPER_ADMIN']), upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Return relative path for storage
    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ fileUrl, originalName: req.file.originalname, mimetype: req.file.mimetype });
});

export default router;
