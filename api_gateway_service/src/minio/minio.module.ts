import { Module } from '@nestjs/common';
import { MinioMusicService } from './minio.service';
import { MinioModule } from 'nestjs-minio-client';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MinioModule.registerAsync({
      inject: [ConfigService],
      useFactory(configService: ConfigService) {
        const minioHost = configService.get('MINIO_HOST');
        const [endPoint, port] = minioHost.split(':');
        return {
          endPoint,
          port: Number(port),
          accessKey: configService.get('MINIO_ACCESS_KEY'),
          secretKey: configService.get('MINIO_SERVICE_KEY'),
          useSSL: false,
        };
      },
    }),
  ],
  controllers: [],
  providers: [MinioMusicService],
  exports: [MinioMusicService],
})
export class MinioMusicModule {}
