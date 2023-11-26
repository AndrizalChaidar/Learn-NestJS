import { ConfigModuleOptions, ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export default class AppConfig {
  static getConfigModuleOptions(): ConfigModuleOptions {
    const options: ConfigModuleOptions = { isGlobal: true };
    const rootServicePath = process.cwd();
    if (['production', 'staging'].includes(process.env.NODE_ENV)) {
      options.ignoreEnvFile = true;
    } else {
      options.envFilePath = [`${rootServicePath}/.env`];
    }
    return options;
  }

  static getTypeOrmModuleOptions(
    configService: ConfigService,
  ): TypeOrmModuleOptions {
    const host = configService.get('POSTGRES_HOST');
    const shouldSyncDb = !['production', 'staging'].includes(
      process.env.NODE_ENV,
    );
    const options: TypeOrmModuleOptions = {
      type: 'postgres',
      host,
      password: configService.get('POSTGRES_PASSWORD'),
      port: Number(configService.get('POSTGRES_PORT')),
      database: configService.get('POSTGRES_DB'),
      username: configService.get('POSTGRES_USERNAME'),
      connectTimeoutMS: 2000,
      entities: ['dist/**/*.entity.js'],
      migrationsRun: shouldSyncDb,
      synchronize: shouldSyncDb,
    };
    return options;
  }
}
