import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Module({
  providers: [PrismaService],
  exports: [PrismaService]   // ⬅️ makes it available to other modules
})
export class PrismaModule {}
