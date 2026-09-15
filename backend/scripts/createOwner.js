require('dotenv').config();
const bcrypt = require('bcrypt');
const prisma = require('../src/prismaClient');


const PLATFORM_BUSINESS_NAME = '__platform__';

async function main() {
    const name = "Dixit";
    const email = "owner@internal.local";
    const password = "11111111";

    if (!name || !email || !password) {
        console.error('Missing one of OWNER_NAME, OWNER_EMAIL, OWNER_PASSWORD env vars. Nothing created.');
        process.exit(1);
    }
    if (password.length < 8) {
        console.error('OWNER_PASSWORD must be at least 8 characters. Nothing created.');
        process.exit(1);
    }

    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing) {
        console.error(`A user with email ${email} already exists (role: ${existing.role}, status: ${existing.status}). Nothing created — if this is meant to be the owner account, update its role/status by hand instead of running this again.`);
        process.exit(1);
    }

    let platformBusiness = await prisma.businesses.findFirst({ where: { name: PLATFORM_BUSINESS_NAME } });
    if (!platformBusiness) {
        platformBusiness = await prisma.businesses.create({ data: { name: PLATFORM_BUSINESS_NAME } });
        console.log(`Created internal "${PLATFORM_BUSINESS_NAME}" business (id: ${platformBusiness.id}) to attach the owner account to.`);
    }

    const password_hash = await bcrypt.hash(password, 12);
    const owner = await prisma.users.create({
        data: {
            business_id: platformBusiness.id,
            name,
            email,
            password_hash,
            role: 'superadmin',
            status: 'active',
            email_verified_at: new Date(),
        },
    });

    console.log(`\nOwner account created:`);
    console.log(`  email: ${owner.email}`);
    console.log(`  id:    ${owner.id}`);
    console.log(`\nLog in at /login with this email and the password you just set. You'll land on /admin/approvals.`);
}

main()
    .catch((err) => {
        console.error('Failed to create owner account:', err.message);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
