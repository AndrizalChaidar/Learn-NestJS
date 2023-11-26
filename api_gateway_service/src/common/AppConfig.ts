import { ConfigModuleOptions, ConfigService } from '@nestjs/config';

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
}
