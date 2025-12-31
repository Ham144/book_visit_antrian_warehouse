import { fakerID_ID } from '@faker-js/faker';
import { Dock, Prisma, PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import {
  AccountType,
  Days,
  mockVehicleBrands,
  Recurring,
  ROLE,
  VehicleType,
} from 'src/common/shared-enum';

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
  ]; // jumlah warehouse organisasi
  const vendorLength = 100; // jumlah vendor
  const accountLength = 10; // jumlah account untuk tiap role
  const passwordHash = await bcrypt.hash('mockuser', 10);
  const dockLength = 4; // masing masing perWH dengan masing masing busytime dan vacant
  const vehicleLength = 50; // jumlah vechicle global

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
      const fullName = fakerID_ID.person.fullName();
      userOrganizationMock.push({
        username: fullName.split(' ')[0],
        displayName: fullName,
        description: 'APP USER',
        driverLicense: null,
        passwordHash: passwordHash,
        driverPhone: fakerID_ID.phone.number(),
        isActive: true,
        mail: `${fullName.split(' ')[0]}@catur.co.id`,
        accountType: AccountType.APP,
        createdAt: new Date(),
        role: ROLE.USER_ORGANIZATION as string,
        updatedAt: new Date(),
        vendorName: null,
        homeWarehouseId: warehousesDB[i].id,
      });
    }
  }

  //sekitar 40 * 10 = 400 account
  for (let i = 0; i < vendorLength; i++) {
    for (let j = 0; j < accountLength; j++) {
      //10 akun ADMIN_VENDOR untuk warehouses[i]
      const fullName = fakerID_ID.person.fullName();

      adminVendorMock.push({
        username: fullName.split(' ')[0],
        displayName: fullName,
        description: 'APP USER',
        driverLicense: null,
        passwordHash: passwordHash,
        driverPhone: fakerID_ID.phone.number(),
        isActive: true,
        mail: `${fullName.split(' ')[0]}@${vendorsMock[i].name}.org`,
        accountType: AccountType.APP,
        createdAt: new Date(),
        role: ROLE.ADMIN_VENDOR as string,
        updatedAt: new Date(),
        vendorName: vendorsMock[i].name,
      });
    }

    for (let j = 0; j < accountLength; j++) {
      //10 akun DRIVER_VENDOR untuk warehouses[i]
      const fullName = fakerID_ID.person.fullName();
      driverAccontMock.push({
        username: fullName.split(' ')[0],
        displayName: fullName,
        description: 'APP USER',
        driverLicense: 'SIM A',
        passwordHash: passwordHash,
        driverPhone: fakerID_ID.phone.number(),
        isActive: true,
        mail: `${fullName.split(' ')[0]}@${vendorsMock[i].name}.org`,
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

  //START connect many-to-many
  await prisma.organization.update({
    where: {
      name: organization.name,
    },
    data: {
      accounts: {
        connect: userDB.map((user) => ({
          username: user.username,
        })),
      },
    },
  });
  for (const warehouse of warehousesDB) {
    const randomRange = Math.floor(Math.random() * userDB.length);

    const userWarehouseAccesses = userDB
      .filter(
        (u) =>
          u.role == ROLE.USER_ORGANIZATION || u.role == ROLE.ADMIN_ORGANIZATION,
      ) //mencegah akun vendor
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
  //END connect many-to-many

  //section 2 = [dock(busytime, vacant), vehicle]
  const docksMock: Prisma.DockCreateManyInput[] = [];

  const busyTimesMock: Prisma.DockBusyTimeCreateManyInput[] = [];
  const vacantsMock: Prisma.VacantCreateManyInput[] = [];

  const daysArray = Object.values(Days);
  // ENUM SOURCE (TIDAK DIMUTATE)
  const vehicleTypes = Object.values(VehicleType);

  for (let wh_idx = 0; wh_idx < warehousesDB.length; wh_idx++) {
    for (let dock_idx = 0; dock_idx < dockLength; dock_idx++) {
      // 🔥 CLONE TIAP DOCK
      const allowedTypes = [...vehicleTypes];
      const selectedAllowedTypes: string[] = [];

      const count = Math.min(5, allowedTypes.length);

      for (let j = 0; j < count; j++) {
        const randomIndex = Math.floor(Math.random() * allowedTypes.length);

        // splice return array → ambil index 0
        const [type] = allowedTypes.splice(randomIndex, 1);

        selectedAllowedTypes.push(type);
      }

      docksMock.push({
        name: fakerID_ID.lorem.word({ length: 7 }),
        warehouseId: warehousesDB[wh_idx].id,
        allowedTypes: selectedAllowedTypes,
        organizationName: organization.name,
        isActive: true,
        priority: Math.floor(Math.random() * 5) + 1,
      });
    }
  }

  const docksDB = await prisma.dock.createManyAndReturn({
    data: docksMock,
    skipDuplicates: true,
  });

  //buat busytimes dan vacants untuk tiap dock
  docksDB.forEach((dock: Dock) => {
    for (let k = 0; k < daysArray.length; k++) {
      vacantsMock.push({
        dockId: dock.id,
        availableFrom: '08:00',
        availableUntil: '16:00',
        day: daysArray[k], // "SENIN", "SELASA", dst
      });
    }

    busyTimesMock.push({
      dockId: dock.id,
      reason: 'Makan siang',
      recurring: Recurring.WEEKLY,
      from: '12:00',
      to: '13:00',
      recurringCustom: [
        Days.SENIN,
        Days.SELASA,
        Days.RABU,
        Days.KAMIS,
        Days.JUMAT,
        Days.SABTU,
      ],
    });
  });

  const mockVehicles: Prisma.VehicleCreateManyInput[] = [];

  for (let v_idx = 0; v_idx < vehicleLength; v_idx++) {
    const selectedVehicleBrandIdx = Math.floor(
      Math.random() * mockVehicleBrands.length,
    );
    mockVehicles.push({
      brand: mockVehicleBrands[selectedVehicleBrandIdx],
      durasiBongkar: Math.floor(Math.random() * (120 - 30 + 1)) + 30,
      vehicleType:
        vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
      description: fakerID_ID.lorem.word({ length: 11 }),
      productionYear: Math.floor(Math.random() * (2010 - 1999 + 1)) + 1999,
      isActive: true,
      organizationName: organization.name,
    });
  }

  const busyTimeDB = await prisma.dockBusyTime.createMany({
    data: busyTimesMock,
    skipDuplicates: true,
  });
  const vacantDB = await prisma.vacant.createMany({
    data: vacantsMock,
    skipDuplicates: true,
  });

  const vehicleDB = await prisma.vehicle.createMany({
    data: mockVehicles,
    skipDuplicates: true,
  });
  console.log('vendorsDB.length:', vendorsDB.count);
  console.log('warehousesDB.length:', warehousesDB.length);
  console.log('userDB.length:', userDB.length);
  console.log('docksDB.length:', docksDB.length + ' for each');
  console.log('busyTimeDB.length:', busyTimeDB.count);
  console.log('vacantDB.length:', vacantDB.count);
  console.log('vehicleDB.length:', vehicleDB.count);
}
init();
