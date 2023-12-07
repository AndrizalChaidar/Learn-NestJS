import { Module } from '@nestjs/common';
import { SongsModule } from './songs/songs.module';
import { ConfigModule } from '@nestjs/config';
import { MinioMusicModule } from './minio/minio.module';
import AppConfig from './common/app.config';

@Module({
  imports: [
    ConfigModule.forRoot(AppConfig.getConfigModuleOptions()),
    SongsModule,
    MinioMusicModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
