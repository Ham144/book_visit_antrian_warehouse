import { fakerID_ID } from '@faker-js/faker';
import { PrismaClient, User, Warehouse } from '@prisma/client';
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
  const passwordHash = await bcrypt.hash('SMD2025!', 10);
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

  const vendorsMock: Warehouse[] = [];
  //buat vendor
  for (let i = 0; i < vendorLength; i++) {
    const vendor_name = fakerID_ID.company.name();
    vendorsMock.push({
      id: fakerID_ID.database.mongodbObjectId(),
      name: vendor_name,
      description: `${vendor_name} is ${fakerID_ID.lorem.sentence({ min: 3, max: 6 })} we are ${fakerID_ID.lorem.sentence({ min: 2, max: 4 })}`,
      location: fakerID_ID.location.streetAddress(),
      isActive: true,
      organizationName: organization.name,
      createdAt: new Date(),
    });
  }

  const warehousesMock: Warehouse[] = [];
  for (let i = 0; i < warehousesName.length; i++) {
    warehousesMock.push({
      name: warehousesName[i],
      description: fakerID_ID.lorem.sentence(),
      location: fakerID_ID.location.streetAddress(),
      isActive: true,
      organizationName: organization.name,
      id: fakerID_ID.database.mongodbObjectId(),
      createdAt: new Date(),
    });
  }

  //ADMIN_WAREHOUSE accounts hanya satu si ham
  const userOrganizationMock: User[] = [];
  const adminVendorMock: User[] = [];
  const driverAccontMock: User[] = [];

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
        homeWarehouseId: warehousesMock[i].id,
        accountType: AccountType.APP,
        createdAt: new Date(),
        role: ROLE.USER_ORGANIZATION,
        updatedAt: new Date(),
        vendorName: null,
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
        mail: `${username_ADMIN_VENDOR}@${warehousesMock[i].name}.org`,
        homeWarehouseId: warehousesMock[i].id,
        accountType: AccountType.APP,
        createdAt: new Date(),
        role: ROLE.ADMIN_VENDOR,
        updatedAt: new Date(),
        vendorName: warehousesMock[i].name,
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
        mail: `${username_DRIVER_VENDOR}@${warehousesMock[i].name}.org`,
        homeWarehouseId: warehousesMock[i].id,
        accountType: AccountType.APP,
        createdAt: new Date(),
        role: ROLE.DRIVER_VENDOR,
        updatedAt: new Date(),
        vendorName: warehousesMock[i].name,
      });
    }
  }
}
init();
