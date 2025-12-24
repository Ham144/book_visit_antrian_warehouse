import { fakerID_ID } from '@faker-js/faker';
import { Prisma, PrismaClient, User, Vendor, Warehouse } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AccountType, ROLE } from 'src/common/shared-enum';

async function init() {
  const prisma = new PrismaClient();

  //-------START length properties----------------------
  const warehousesName = [
    'MANGGA DUA',
    'KOTA SERANG',
    'BEKASI',
    'CIJERAH',
    'CIKAMPEK',
    'CIPOPDOH',
    'PLUIT',
    'SENTUL',
    'PERMATA',
    'GLODOK F',
    'GLODOK A',
  ];
  const vendorLength = 100;
  const accountLength = 10;
  const passwordHash = await bcrypt.hash('mockuser', 10);
  //-----------END length properties----------------------

  const organization = await prisma.organization.create({
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

  const vendorsMock: Prisma.VendorCreateManyInput[] = [];
  //buat vendor
  for (let i = 0; i < vendorLength; i++) {
    const vendor_name = fakerID_ID.company.name();
    vendorsMock.push({
      name: vendor_name,
      organizationName: organization.name,
    });
  }
  const vendorsDB = await prisma.vendor.createMany({
    data: vendorsMock,
    skipDuplicates: true,
  });

  const warehousesMock: Prisma.WarehouseCreateManyInput[] = [];
  for (let i = 0; i < warehousesName.length; i++) {
    warehousesMock.push({
      name: warehousesName[i].toUpperCase(),
      description: fakerID_ID.lorem.sentence(),
      location: fakerID_ID.location.streetAddress(),
      isActive: true,
      organizationName: organization.name,
    });
  }
  const warehousesDB = await prisma.warehouse.createManyAndReturn({
    data: warehousesMock,
  });

  //ADMIN_WAREHOUSE accounts hanya satu si ham
  const userOrganizationMock: Prisma.UserCreateManyInput[] = [];
  const adminVendorMock: Prisma.UserCreateManyInput[] = [];
  const driverAccontMock: Prisma.UserCreateManyInput[] = [];

  //sekitar 11 * 10 = 110 account
  for (let i = 0; i < warehousesName.length; i++) {
    for (let j = 0; j < accountLength; j++) {
      //10 akun USER_ORGANIZATION untuk warehouses[i]
      const username_USER_ORGANIZATION = fakerID_ID.person.firstName();
      userOrganizationMock.push({
        username: username_USER_ORGANIZATION,
        displayName: fakerID_ID.person.fullName(),
        description: 'APP USER',
        driverLicense: null,
        passwordHash: passwordHash,
        driverPhone: fakerID_ID.phone.number(),
        isActive: true,
        mail: `${username_USER_ORGANIZATION}@catur.co.id`,
        accountType: AccountType.APP,
        createdAt: new Date(),
        role: ROLE.USER_ORGANIZATION as string,
        updatedAt: new Date(),
        vendorName: null,
        homeWarehouseId: warehousesMock[i].id,
      });
    }
  }

  //sekitar 40 * 10 = 400 account
  for (let i = 0; i < vendorLength; i++) {
    for (let j = 0; j < accountLength; j++) {
      //10 akun ADMIN_VENDOR untuk warehouses[i]
      const username_ADMIN_VENDOR = fakerID_ID.person.firstName();
      adminVendorMock.push({
        username: username_ADMIN_VENDOR,
        displayName: fakerID_ID.person.fullName(),
        description: 'APP USER',
        driverLicense: null,
        passwordHash: passwordHash,
        driverPhone: fakerID_ID.phone.number(),
        isActive: true,
        mail: `${username_ADMIN_VENDOR}@${vendorsMock[i].name}.org`,
        accountType: AccountType.APP,
        createdAt: new Date(),
        role: ROLE.ADMIN_VENDOR as string,
        updatedAt: new Date(),
        vendorName: vendorsMock[i].name,
      });
    }

    for (let j = 0; j < accountLength; j++) {
      //10 akun DRIVER_VENDOR untuk warehouses[i]
      const username_DRIVER_VENDOR = fakerID_ID.person.firstName();
      driverAccontMock.push({
        username: username_DRIVER_VENDOR,
        displayName: fakerID_ID.person.fullName(),
        description: 'APP USER',
        driverLicense: 'SIM A',
        passwordHash: passwordHash,
        driverPhone: fakerID_ID.phone.number(),
        isActive: true,
        mail: `${username_DRIVER_VENDOR}@${vendorsMock[i].name}.org`,
        accountType: AccountType.APP,
        createdAt: new Date(),
        role: ROLE.DRIVER_VENDOR as string,
        updatedAt: new Date(),
        vendorName: vendorsMock[i].name,
      });
    }
  }

  const userDB = await prisma.user.createManyAndReturn({
    data: [...userOrganizationMock, ...adminVendorMock, ...driverAccontMock],
    skipDuplicates: true,
  });

  //connect many-to-many
  await prisma.organization.update({
    where: {
      name: organization.name,
    },
    data: {
      accounts: {
        connect: userOrganizationMock.map((user) => ({
          username: user.username,
        })),
      },
    },
  });

  for (const warehouse of warehousesDB) {
    const randomRange = Math.floor(Math.random() * userDB.length);

    const userWarehouseAccesses = userDB
      .slice(randomRange, randomRange + 7)
      .map((u) => ({ username: u.username }));

    await prisma.warehouse.update({
      where: { id: warehouse.id },
      data: {
        userWarehouseAccesses: {
          connect: userWarehouseAccesses,
        },
      },
    });

    console.log('warehouse:', warehouse.name);
    console.log('userAccess:', userWarehouseAccesses);
  }

  console.log('vendorsDB.count:', vendorsDB.count);
  console.log('warehousesDB.length:', warehousesDB.length);
  console.log('userDB.length:', userDB.length);
}
init();
