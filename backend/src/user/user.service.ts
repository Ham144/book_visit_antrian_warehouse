import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma.service';
import * as LdapClient from 'ldapjs-client';
import * as jwt from 'jsonwebtoken';
import { RedisService } from 'src/redis/redis.service';
import { randomUUID } from 'crypto';
import { LoginRequestLdapDto, LoginResponseDto } from './dto/login.dto';
import { TokenPayload } from './dto/token-payload.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private redis: RedisService,
  ) {}

  async loginUser(body: LoginRequestLdapDto, req: any) {
    const organizationSetting =
      await this.prismaService.organization.findUnique({
        where: {
          name: body.organization,
        },
      });

    if (!organizationSetting) {
      throw new BadRequestException('Organization Setting tidak ditemukna.');
    }

    //LDAP/ AD
    const client = new LdapClient({
      url: `ldap://${organizationSetting.AD_HOST}:${organizationSetting.AD_PORT}`,
    });

    const bindDn = `${organizationSetting.AD_DOMAIN}\\${body.username}`;
    // const baseDN = "dc=catur,dc=co,dc=id";
    const baseDN = organizationSetting.AD_BASE_DN;

    let userInfo: LoginResponseDto;
    let userLDAP: any;
    try {
      // Langkah 1: Bind dulu
      await client.bind(bindDn, body.password);
      // Langkah 2: Search
      const result = await client.search(baseDN, {
        scope: 'sub',
        filter: `(sAMAccountName=${body.username})`, // ganti dengan user yang kamu tahu
        attributes: [
          'description',
          'displayName',
          'mail',
          'telephoneNumber',
          'physicalDeliveryOfficeName',
        ],
        // attributes: ['*'],
      });
      userLDAP = result[0];
    } catch (error) {
      throw new BadRequestException({
        message: 'credential yang anda masukkan salah',
      });
    }
    if (!userLDAP['physicalDeliveryOfficeName']) {
      throw new BadRequestException({
        message:
          'User terkait tidak memiliki warehouse:physicalDeliveryOfficeName',
      });
    }
    let user = await this.prismaService.user.findUnique({
      where: {
        username: body.username,
      },
      include: {
        homeWarehouse: true,
      },
    });
    //jika user sebelumnya memiliki description yg berbeda dengan ldap :ganti
    if (user) {
      //bagian pemeriksaan field yg berubah
      let warehouseId = user.homeWarehouseId;

      if (
        String(userLDAP['physicalDeliveryOfficeName']).toUpperCase() !==
        user?.homeWarehouse?.name
      ) {
        //rumah baru - upsert warehouse dulu
        const newWarehouse = await this.prismaService.warehouse.upsert({
          where: {
            name: String(userLDAP['physicalDeliveryOfficeName']).toUpperCase(),
          },
          update: {},
          create: {
            name: String(userLDAP['physicalDeliveryOfficeName']).toUpperCase(),
          },
        });

        warehouseId = newWarehouse.id;
      }

      user = await this.prismaService.user.update({
        where: {
          username: body.username,
        },
        data: {
          description: userLDAP['description'],
          displayName: userLDAP['displayName'],
          homeWarehouseId: warehouseId,
        },
        include: {
          homeWarehouse: true,
        },
      });
    } else {
      const transactionResult = await this.prismaService.$transaction(
        async (tx) => {
          const warehouse = await tx.warehouse.upsert({
            where: { name: userLDAP['physicalDeliveryOfficeName'] },
            update: {},
            create: {
              name: String(
                userLDAP['physicalDeliveryOfficeName'],
              ).toUpperCase(),
            },
          });

          const createdUser = await tx.user.upsert({
            where: { username: body.username },
            update: {},
            create: {
              username: body.username,
              description: userLDAP['description'],
              homeWarehouseId: warehouse.id,
              displayName:
                userLDAP['displayName'] || userLDAP['name'] || body.username,
            },
            include: {
              homeWarehouse: true,
            },
          });

          return createdUser;
        },
      );
      //tambah kan user baru itu sbg first member
      await this.prismaService.warehouse.update({
        where: { id: transactionResult.homeWarehouseId },
        data: {
          members: {
            connect: {
              username: transactionResult.username,
            },
          },
        },
        include: { members: true },
      });
      user = transactionResult;
    }

    const payload: TokenPayload = {
      username: user.username,
      description: user.description,
      homeWarehouseId: user.homeWarehouseId,
      jti: randomUUID(),
    };

    // Generate JWT tokens using reusable method
    const access_token = this.generateToken(payload, 'access');
    const refresh_token = this.generateToken(payload, 'refresh');

    if (!access_token || !refresh_token) {
      throw new Error('Failed to generate authentication tokens');
    }

    //simpan refresh_token ke redis
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
      access_token,
      refresh_token,
      organizationName: organizationSetting.name,
      ...user,
    };
    return plainToInstance(LoginResponseDto, userInfo, {
      excludeExtraneousValues: true,
      groups: ['login'],
    });
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
        description: userDB?.description,
        homeWarehouseId: userDB.homeWarehouseId,
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

  async getAllAccount(page: number, searchKey: string) {
    const accounts = await this.prismaService.user.findMany({
      where: {
        username: {
          contains: searchKey,
        },
      },
      include: {
        homeWarehouse: true,
      },
      skip: (page - 1) * 10,
      take: 10,
    });

    return accounts.map((account) => ({
      username: account.username,
      displayName: account.displayName,
      description: account.description,
      isActive: account.isActive,
      warehouse: account.homeWarehouse
        ? {
            id: account.homeWarehouse.id,
            name: account.homeWarehouse.name,
            location: account.homeWarehouse.location,
            description: account.homeWarehouse.description,
            isActive: account.homeWarehouse.isActive,
          }
        : null,
    }));
  }

  async updateAccount(body: LoginResponseDto) {
    const updated = await this.prismaService.user.update({
      where: {
        username: body.username,
      },
      data: {
        displayName: body.displayName,
        isActive: body.isActive,
      },
    });
    return {
      username: updated.username,
      displayName: updated.displayName,
      description: updated.description,
      isActive: updated.isActive,
    };
  }

  async getUserInfo(req: any) {
    //ubah payload sedikit agar bisa langsung dipakai
    const myWarehouse = await this.prismaService.warehouse.findUnique({
      where: { id: req.user.homeWarehouseId },
    });
    req.homeWarehouse = myWarehouse;
    const myOrg = await this.prismaService.organization.findFirst({
      where: {
        warehouses: {
          some: {
            id: req.user.homeWarehouse.id,
          },
        },
      },
    });
    if (!myOrg) {
      throw new NotFoundException('Organization not found');
    }
    req.organization = myOrg;

    delete req.user.jti;
    return plainToInstance(LoginResponseDto, req.user, {
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
  // Reusable token generator
  private generateToken(
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
