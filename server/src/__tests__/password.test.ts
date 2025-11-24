import bcrypt from 'bcryptjs';

describe('Password Utilities', () => {
    describe('bcrypt hashing', () => {
        it('should hash passwords correctly', async () => {
            const password = 'testPassword123';
            const hash = await bcrypt.hash(password, 10);

            expect(hash).toBeDefined();
            expect(hash).not.toBe(password);
            expect(hash.length).toBeGreaterThan(0);
        });

        it('should verify correct passwords', async () => {
            const password = 'testPassword123';
            const hash = await bcrypt.hash(password, 10);
            const isValid = await bcrypt.compare(password, hash);

            expect(isValid).toBe(true);
        });

        it('should reject incorrect passwords', async () => {
            const password = 'testPassword123';
            const wrongPassword = 'wrongPassword456';
            const hash = await bcrypt.hash(password, 10);
            const isValid = await bcrypt.compare(wrongPassword, hash);

            expect(isValid).toBe(false);
        });
    });
});
