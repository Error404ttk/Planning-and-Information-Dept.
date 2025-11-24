import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

const prisma = new PrismaClient();

async function check() {
    console.log('--- Environment Check ---');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    console.log('PORT:', process.env.PORT);
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set (Hidden)' : 'NOT SET');
    console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set (Hidden)' : 'NOT SET');

    console.log('\n--- Directory Check ---');
    const uploadsDir = path.join(__dirname, '../uploads');
    const logsDir = path.join(__dirname, '../logs');

    console.log('Uploads dir exists:', fs.existsSync(uploadsDir));
    console.log('Logs dir exists:', fs.existsSync(logsDir));

    console.log('\n--- Database Connection Check ---');
    try {
        await prisma.$connect();
        console.log('✅ Database connection successful');

        const userCount = await prisma.user.count();
        console.log('✅ Users table accessible. Count:', userCount);

        const resourceCount = await prisma.resource.count();
        console.log('✅ Resources table accessible. Count:', resourceCount);

    } catch (error) {
        console.error('❌ Database connection failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

check();
