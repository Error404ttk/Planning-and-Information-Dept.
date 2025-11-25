
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
    console.log('🔍 Starting Login Diagnosis...');

    try {
        // 1. Check Database Connection
        console.log('1️⃣  Testing Database Connection...');
        await prisma.$connect();
        console.log('✅ Database Connected Successfully');

        // 2. Check Admin User
        console.log('\n2️⃣  Checking Admin User...');
        const admin = await prisma.user.findUnique({ where: { username: 'admin' } });

        if (!admin) {
            console.error('❌ Admin user NOT found in database!');
            console.log('   Run "npx tsx src/seed.ts" to create default users.');
            return;
        }
        console.log('✅ Admin user found:', admin.username);
        console.log('   Role:', admin.role);
        console.log('   Password Hash Length:', admin.password.length);

        // 3. Test Password Verification
        console.log('\n3️⃣  Testing Password Verification...');
        const testPassword = 'password';
        let isMatch = false;
        try {
            isMatch = await bcrypt.compare(testPassword, admin.password);
        } catch (err) {
            console.error('❌ Bcrypt error:', err);
        }

        if (isMatch) {
            console.log('✅ Password "password" matches the stored hash.');
        } else {
            console.error('❌ Password "password" does NOT match the stored hash.');
            // Test if it's plain text
            if (admin.password === testPassword) {
                console.warn('⚠️  Stored password is PLAIN TEXT (not hashed).');
            }
        }

        // 4. Test JWT Signing
        console.log('\n4️⃣  Testing JWT Signing...');
        const JWT_SECRET = process.env.JWT_SECRET;
        console.log('   JWT_SECRET exists:', !!JWT_SECRET);
        if (!JWT_SECRET) {
            console.warn('⚠️  JWT_SECRET is missing in process.env! Using fallback.');
        }

        try {
            const secret = JWT_SECRET || 'super-secret-key-change-in-prod';
            const token = jwt.sign(
                { userId: admin.id, username: admin.username, role: admin.role },
                secret,
                { expiresIn: '1d' }
            );
            console.log('✅ JWT Signing successful. Token length:', token.length);
        } catch (jwtError) {
            console.error('❌ JWT Signing FAILED:', jwtError);
        }

        console.log('\n✅ Diagnosis Complete. If all checks passed, the issue might be in PM2 environment or Network.');
        console.log('👉 Please run "pm2 logs" to see the actual server error.');


    } catch (error) {
        console.error('\n❌ CRITICAL ERROR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
