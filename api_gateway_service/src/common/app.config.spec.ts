import AppConfig from './app.config';

describe('AppConfig', () => {
  afterEach(() => {
    jest.resetAllMocks();
    jest.restoreAllMocks();
  });
  describe('getConfigModuleOptions', () => {
    it('should return "ignoreEnvFile" is true', () => {
      jest.replaceProperty(process.env, 'NODE_ENV', 'staging');
      const result = AppConfig.getConfigModuleOptions();
      expect(result).toEqual({
        isGlobal: true,
        ignoreEnvFile: true,
      });
    });
    it('should return "envFilePath" is an Array with path to .env file', () => {
      const result = AppConfig.getConfigModuleOptions();
      expect(result).toEqual({
        isGlobal: true,
        envFilePath: [process.cwd() + '/.env'],
      });
    });
  });
});
