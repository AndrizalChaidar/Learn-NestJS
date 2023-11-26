import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SongsModule } from './songs/songs.module';
import AppConfig from './common/AppConfig';

@Module({
  imports: [
    ConfigModule.forRoot(AppConfig.getConfigModuleOptions()),
    TypeOrmModule.forRootAsync({
      useFactory: async (configService: ConfigService) => {
        return AppConfig.getTypeOrmModuleOptions(configService);
      },
      inject: [ConfigService],
    }),
    SongsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
