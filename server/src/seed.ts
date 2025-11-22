import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    // SHA-256 hash for "password" used in frontend was: 5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8
    // But we are switching to bcrypt.
    // Default password: "password"
    const password = 'password';
    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {
            password: hashedPassword, // Reset password to default
            mustChangePassword: true, // Force password change even for existing users
        },
        create: {
            username: 'admin',
            password: hashedPassword,
            name: 'Super Administrator',
            role: 'SUPER_ADMIN',
            mustChangePassword: true, // Force password change on first login
        },
    });

    const staff = await prisma.user.upsert({
        where: { username: 'staff' },
        update: {
            password: hashedPassword, // Reset password to default
            mustChangePassword: true, // Force password change even for existing users
        },
        create: {
            username: 'staff',
            password: hashedPassword,
            name: 'Content Staff',
            role: 'ADMIN',
            mustChangePassword: true, // Force password change on first login
        },
    });

    console.log({ admin, staff });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
