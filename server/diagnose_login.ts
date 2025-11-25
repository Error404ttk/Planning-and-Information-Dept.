
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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
        const isMatch = await bcrypt.compare(testPassword, admin.password);

        if (isMatch) {
            console.log('✅ Password "password" matches the stored hash.');
            console.log('   Login SHOULD work.');
        } else {
            console.error('❌ Password "password" does NOT match the stored hash.');
            console.log('   This means the password in the DB is different.');

            // Test if it's plain text
            if (admin.password === testPassword) {
                console.warn('⚠️  Stored password is PLAIN TEXT (not hashed).');
                console.warn('   The login system expects a hash. Please run seed to fix.');
            }
        }

    } catch (error) {
        console.error('\n❌ CRITICAL ERROR:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
