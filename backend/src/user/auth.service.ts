import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import * as LdapClient from 'ldapjs-client';
import * as jwt from 'jsonwebtoken';
import { RedisService } from 'src/redis/redis.service';
import { randomUUID } from 'crypto';
import { LoginRequestDto, LoginResponseDto } from './dto/login.dto';
import { TokenPayload } from './dto/token-payload.dto';
import { plainToInstance } from 'class-transformer';
import { Warehouse } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { AccountType, ROLE } from 'src/common/shared-enum';

@Injectable()
export class AuthService {
  constructor(
    private prismaService: PrismaService,
    private redis: RedisService,
  ) {}

  async loginUserAD(body: LoginRequestDto, req: any) {
    const organizationSetting =
      await this.prismaService.organization.findUnique({
        where: { name: String(body.organization) },
      });

    if (!organizationSetting) {
      throw new BadRequestException('Organization Setting tidak ditemukan.');
    }

    // LDAP Client
    const client = new LdapClient({
      url: `ldap://${organizationSetting.AD_HOST}:${organizationSetting.AD_PORT}`,
    });

    const bindDn = `${organizationSetting.AD_DOMAIN}\\${body.username}`;
    const baseDN = organizationSetting.AD_BASE_DN;

    let userLDAP: any;
    try {
      await client.bind(bindDn, body.password);
      const result = await client.search(baseDN, {
        scope: 'sub',
        filter: `(sAMAccountName=${body.username})`,
        attributes: [
          'description',
          'displayName',
          'mail',
          'telephoneNumber',
          'physicalDeliveryOfficeName',
        ],
      });
      userLDAP = result[0];
    } catch (error) {
      throw new BadRequestException('Kredensial yang Anda masukkan salah');
    }

    // Ambil data LDAP dengan aman
    const ldapDescription = userLDAP?.['description'] || '';
    const ldapDisplayName =
      userLDAP?.['displayName'] || userLDAP?.['name'] || body.username;
    const ldapMail = userLDAP?.['mail'] || null;
    const officeName = userLDAP?.['physicalDeliveryOfficeName'] || null; // Bisa null jika tidak ada

    // Cari user di database
    let user = await this.prismaService.user.findUnique({
      where: { username: body.username.toLowerCase() },
      include: { homeWarehouse: { select: { id: true, name: true } } },
    });

    // Jika user sudah ada
    if (user) {
      let warehouseId = user.homeWarehouseId;

      // Update warehouse hanya jika officeName ADA dan BERBEDA
      if (officeName && officeName.toUpperCase() !== user.homeWarehouse?.name) {
        const newWarehouse = await this.prismaService.warehouse.upsert({
          where: { name: officeName.toUpperCase() },
          update: {},
          create: {
            name: officeName.toUpperCase(),
            organizationName: organizationSetting.name,
          },
        });
        warehouseId = newWarehouse.id;
      }
      // Jika officeName tidak ada, set warehouseId ke null (vendor)
      else if (!officeName) {
        warehouseId = null;
      }

      user = await this.prismaService.user.update({
        where: { username: body.username.toLowerCase() },
        data: {
          description: ldapDescription,
          displayName: ldapDisplayName,
          homeWarehouseId: warehouseId, // Bisa null
          accountType: AccountType.AD,
          mail: ldapMail,
        },
        include: { homeWarehouse: true },
      });
    }
    // User baru
    else {
      // Tentukan role
      let role = ROLE.USER_ORGANIZATION;
      if (ldapDescription === 'IT') {
        role = ROLE.ADMIN_ORGANIZATION;
      } else if (!officeName) {
        role = ROLE.ADMIN_VENDOR; // Tidak punya office -> vendor
      }

      // Buat user (homeWarehouseId bisa null jika vendor)
      const newUser = await this.prismaService.user.create({
        data: {
          username: body.username.toLowerCase(),
          description: ldapDescription,
          displayName: ldapDisplayName,
          mail: ldapMail,
          homeWarehouseId: officeName ? undefined : null, // Penting: null jika vendor
          accountType: AccountType.AD,
          role: role,
          organizations: {
            connect: { name: organizationSetting.name },
          },
        },
      });

      // Jika punya office, hubungkan ke warehouse
      if (officeName) {
        const warehouse = await this.prismaService.warehouse.upsert({
          where: { name: officeName.toUpperCase() },
          update: {},
          create: {
            name: officeName.toUpperCase(),
            organizationName: organizationSetting.name,
          },
        });

        // Update user dengan warehouseId
        await this.prismaService.user.update({
          where: { username: newUser.username },
          data: { homeWarehouseId: warehouse.id },
        });

        // Hubungkan user ke warehouse
        await this.prismaService.warehouse.update({
          where: { id: warehouse.id },
          data: {
            homeMembers: { connect: { username: newUser.username } },
            userWarehouseAccesses: { connect: { username: newUser.username } },
          },
        });
      }

      // Ambil ulang user dengan include warehouse
      user = await this.prismaService.user.findUnique({
        where: { username: newUser.username },
        include: { homeWarehouse: true },
      });
    }

    // Proses vendor dari description (asumsi format: something_VENDORNAME)
    if (ldapDescription && ldapDescription.includes('_')) {
      let vendorName = null;
      if (ldapDescription && ldapDescription.includes('_')) {
        const parts = ldapDescription.split('_');
        if (parts.length >= 2 && parts[1].trim() !== '') {
          vendorName = parts[1]; // Ambil setelah underscore pertama
        }
      }
      if (vendorName) {
        await this.prismaService.vendor.upsert({
          where: { name: vendorName },
          update: {},
          create: {
            name: vendorName,
            organizationName: organizationSetting.name,
            members: { connect: { username: user.username } },
          },
        });

        // Update user dengan vendorName
        user = await this.prismaService.user.update({
          where: { username: user.username },
          data: { vendorName },
          include: { homeWarehouse: true },
        });
      }
    }

    const payload: TokenPayload = {
      username: user.username,
      role: user.role as ROLE,
      homeWarehouseId: user.homeWarehouseId, // Bisa null
      organizationName: organizationSetting.name,
      vendorName: user.vendorName || null,
      jti: randomUUID(),
    };

    const access_token = this.generateToken(payload, 'access');
    const refresh_token = this.generateToken(payload, 'refresh');

    await this.redis.set(
      payload.jti,
      JSON.stringify({
        username: payload.username,
        ip: req.ip,
        userAgent: req.headers['user-agent'],
      }),
      604800,
    );

    const userInfo = {
      ...user,
      access_token,
      refresh_token,
      organizationName: organizationSetting.name,
      homeWarehouse: user.homeWarehouse,
      role: user.role,
    };

    return plainToInstance(LoginResponseDto, userInfo, {
      excludeExtraneousValues: true,
      groups: ['login'],
    });
  }

  async loginUserAPP(body: LoginRequestDto, req: any) {
    const organizationSetting =
      await this.prismaService.organization.findUnique({
        where: {
          name: body.organization,
        },
      });

    if (!organizationSetting) {
      throw new BadRequestException('Organization Setting tidak ditemukan.');
    }

    let userInfo: LoginResponseDto;
    try {
      const user = await this.prismaService.user.findFirst({
        where: {
          username: body.username.toLowerCase(),
          organizations: {
            some: {
              name: organizationSetting.name,
            },
          },
        },
        include: {
          homeWarehouse: true,
        },
      });

      if (!user) {
        throw new BadRequestException('User tidak ditemukan');
      }

      const isPasswordCorrect = await bcrypt.compare(
        body.password,
        user.passwordHash,
      );

      if (!isPasswordCorrect) {
        throw new BadRequestException({
          message: 'credential yang anda masukkan salah',
        });
      }

      const payload: TokenPayload = {
        username: user.username,
        role: user.role as ROLE,
        homeWarehouseId: user?.homeWarehouseId || null,
        vendorName: user.vendorName || null,
        organizationName: organizationSetting.name,
        jti: randomUUID(),
      };

      const access_token = this.generateToken(payload, 'access');
      const refresh_token = this.generateToken(payload, 'refresh');

      if (!access_token || !refresh_token) {
        throw new Error('Failed to generate authentication tokens');
      }

      await this.redis.set(
        payload.jti,
        JSON.stringify({
          username: payload.username,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
        }),
        604800, // 1 minggu
      );

      userInfo = {
        ...user,
        access_token,
        refresh_token,
        organizationName: organizationSetting.name,
        homeWarehouse: user.homeWarehouse,
        role: user.role as ROLE,
      };

      return plainToInstance(LoginResponseDto, userInfo, {
        excludeExtraneousValues: true,
        groups: ['login'],
      });
    } catch (error) {
      throw new BadRequestException({
        message: error.message,
      });
    }
  }

  async refreshToken(refresh_token: string) {
    if (!refresh_token) throw new UnauthorizedException('No refresh token');

    try {
      const oldPayload: TokenPayload = await jwt.verify(
        refresh_token,
        process.env.JWT_SECRET_REFRESH,
      );

      // Cek Redis untuk validasi session
      // Jika Redis error, lanjutkan (fallback untuk development)
      let isJtiFound: string | null = null;
      try {
        isJtiFound = await this.redis.get(oldPayload.jti);
      } catch (redisError) {
        console.log('continue, redis error: ', redisError);
      }

      // Jika JTI tidak ditemukan di Redis, session mungkin sudah expired/dicabut
      if (isJtiFound === null) {
        throw new UnauthorizedException('Session anda telah dicabut (redis)');
      }

      const userDB = await this.prismaService.user.findFirst({
        where: {
          username: oldPayload.username,
        },
        include: {
          homeWarehouse: true,
        },
      });

      if (!userDB) throw new UnauthorizedException('Akun anda telah dihapus');

      const newJti = randomUUID();
      const newPayload: TokenPayload = {
        username: userDB.username,
        role: userDB?.role as ROLE,
        homeWarehouseId: userDB?.homeWarehouseId || null,
        vendorName: userDB?.vendorName || null,
        organizationName: oldPayload.organizationName,
        jti: newJti as unknown as string,
      };

      const accessToken = await this.generateToken(newPayload, 'access');
      const refreshToken = await this.generateToken(newPayload, 'refresh'); //perbarui juga refresh Token (metode yang dipakai oleh: Google, AWS Cognito, Auth0, Clerk)

      // Update JTI di Redis dengan JTI baru
      // Hapus JTI lama dan set JTI baru
      try {
        await this.redis.del(oldPayload.jti);
        // Set JTI baru dengan TTL 1 minggu (604800 detik)
        await this.redis.set(
          newJti,
          JSON.stringify({
            username: userDB.username,
            refreshedAt: new Date().toISOString(),
          }),
          604800, // 1 minggu
        );
      } catch (redisError) {
        // Jika Redis tidak tersedia, tetap generate token
      }

      return {
        access_token: accessToken,
        refresh_token: refreshToken,
      };
    } catch (err) {
      // Jika sudah UnauthorizedException, throw langsung
      if (err instanceof UnauthorizedException) {
        throw err;
      }
      // Error lainnya
      throw new UnauthorizedException('Session Anda telah habis, login ulang');
    }
  }

  async getUserInfo(req: any) {
    //ubah payload sedikit agar bisa langsung dipakai
    let userInfo: LoginResponseDto = req.user;

    let myWarehouse: Warehouse;
    if (userInfo?.homeWarehouseId) {
      myWarehouse = await this.prismaService.warehouse.findUnique({
        where: { id: req.user.homeWarehouseId },
      });
      userInfo.homeWarehouse = myWarehouse;
    }

    return plainToInstance(LoginResponseDto, userInfo, {
      excludeExtraneousValues: true,
    });
  }

  async logout(access_token: string, req: any) {
    // if no access_token, continue to clear any session if exists
    let oldPayload: TokenPayload;

    try {
      if (!access_token) {
        return { message: 'Access token missing' };
      }
      oldPayload = jwt.verify(
        access_token,
        process.env.JWT_SECRET,
      ) as TokenPayload;
    } catch (err) {
      console.log('JWT verify error:', err.message);
      return {
        message: 'Token invalid or expired',
      };
    }
    await this.redis.del(oldPayload.jti);
    return {
      message: 'Redis jti deleted',
    };
  }

  generateToken(
    payload: TokenPayload,
    type: 'access' | 'refresh' = 'access',
  ): string | null {
    try {
      const secret =
        type === 'access'
          ? process.env.JWT_SECRET
          : process.env.JWT_SECRET_REFRESH;
      const expiresIn = type === 'access' ? '10m' : '7d';
      if (!secret) {
        return null;
      }
      return jwt.sign(payload, secret, { expiresIn });
    } catch (error) {
      return null;
    }
  }
}
