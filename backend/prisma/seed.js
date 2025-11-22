const { PrismaClient } = require('@prisma/client');

async function init() {
  const prisma = new PrismaClient();

  await prisma.organization.create({
    data: {
      name: 'CATUR SUKSES INTERNASIONAL',
      AD_HOST: '192.168.169.254',
      AD_PORT: '389',
      AD_DOMAIN: 'csi',
      AD_BASE_DN: 'DC=csi,DC=my,DC=id',
      subscription: {
        create: {
          start: new Date(),
          plan: 'PREMIUM',
        },
      },
    },
  });

  await prisma.globalsetting.create({
    data: {
      inUse: true,
      settingName: 'DAILY_REPORT',
      createdAt: new Date(),
    },
  });
}
init();
