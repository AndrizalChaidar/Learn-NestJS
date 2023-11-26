import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import Song from 'src/entities/songs.entity';
import { SongsController } from './songs.controller';
import { SongsService } from './songs.service';

@Module({
  controllers: [SongsController],
  providers: [SongsService],
  imports: [TypeOrmModule.forFeature([Song])],
})
export class SongsModule {}
