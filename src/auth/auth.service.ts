import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import * as argon from 'argon2';
import { PrismaService } from './../prisma/prisma.service';
import { AuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  async signUp(dto: AuthDto) {
    const hash = await argon.hash(dto.password);

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          hash,
        },
        select: {
          id: true,
          email: true,
          createdAt: true,
        },
      });

      // delete user.hash;

      return user;
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }

      throw error;
    }
  }

  async signIn(dto: AuthDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) throw new ForbiddenException('Credentials incorrect');

    const passwordMatches = await argon.verify(user.hash, dto.password);

    if (!passwordMatches) throw new ForbiddenException('Credentials incorrect');

    delete user.hash;

    return user;
  }
}
