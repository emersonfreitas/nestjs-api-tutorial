import { PrismaService } from './../prisma/prisma.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}
  signUp() {
    return 'I am signed up';
  }

  signIn() {
    return 'I am signed in';
  }
}
