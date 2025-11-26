import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function seed() {
    console.log('🌱 Starting database seed...');

    // Check if users exist
    const userCount = await prisma.user.count();

    if (userCount > 0) {
        console.log(`✅ Database already has ${userCount} user(s), skipping seed.`);
        return;
    }

    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const adminUser = await prisma.user.create({
        data: {
            username: 'admin',
            password: hashedPassword,
            name: 'ผู้ดูแลระบบ',
            role: 'SUPER_ADMIN',
            mustChangePassword: true
        }
    });

    console.log('✅ Created default admin user:');
    console.log(`   Username: admin`);
    console.log(`   Password: admin123`);
    console.log(`   Role: SUPER_ADMIN`);
    console.log('   ⚠️  Please change password after first login!');

    console.log('\n🌱 Seed completed successfully!');
}

seed()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
