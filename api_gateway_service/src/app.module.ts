import { Module } from '@nestjs/common';
import { SongsModule } from './songs/songs.module';
import { ConfigModule } from '@nestjs/config';
import AppConfig from './common/AppConfig';

@Module({
  imports: [
    ConfigModule.forRoot(AppConfig.getConfigModuleOptions()),
    SongsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
