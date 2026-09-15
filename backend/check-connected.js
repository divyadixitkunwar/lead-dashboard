const prisma = require('./src/prismaClient');
(async () => {
    const channels = await prisma.business_channels.findMany({
        orderBy: { id: 'desc' },
    });
    console.log(JSON.stringify(channels, null, 2));
    process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
