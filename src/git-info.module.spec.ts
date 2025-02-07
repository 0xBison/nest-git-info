import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GitInfoModule } from './git-info.module';
import { GitInfoService } from './git-info.service';
import { GitInfoController } from './git-info.controller';
import { GIT_INFO_OPTIONS } from './git-info.constants';

describe('GitInfoModule', () => {
  describe('register', () => {
    let module: TestingModule;

    it('should work with default options', async () => {
      module = await Test.createTestingModule({
        imports: [GitInfoModule.register()],
      }).compile();

      const controller = module.get(GitInfoController);
      const service = module.get(GitInfoService);
      const options = module.get(GIT_INFO_OPTIONS);

      expect(controller).toBeDefined();
      expect(service).toBeDefined();
      expect(options).toEqual({});
    });

    it('should disable controller when specified', async () => {
      module = await Test.createTestingModule({
        imports: [GitInfoModule.register({ disableController: true })],
      }).compile();

      const service = module.get(GitInfoService);
      expect(service).toBeDefined();
      expect(() => module.get(GitInfoController)).toThrow();
    });

    it('should configure custom environment variables', async () => {
      const customEnvVars = {
        gitSHA: 'CUSTOM_SHA',
        gitBranch: 'CUSTOM_BRANCH',
        additionalVars: {
          DEPLOY_ENV: 'NODE_ENV',
        },
      };

      module = await Test.createTestingModule({
        imports: [
          GitInfoModule.register({
            environmentVariables: customEnvVars,
          }),
        ],
      }).compile();

      const options = module.get(GIT_INFO_OPTIONS);
      expect(options.environmentVariables).toEqual(customEnvVars);
    });

    it('should use custom build info generator', async () => {
      const customGenerator = () => ({
        custom: 'value',
      });

      module = await Test.createTestingModule({
        imports: [
          GitInfoModule.register({
            buildInfoGenerator: customGenerator,
          }),
        ],
      }).compile();

      const options = module.get(GIT_INFO_OPTIONS);
      expect(options.buildInfoGenerator).toBe(customGenerator);
    });
  });

  describe('registerAsync', () => {
    let module: TestingModule;

    it('should work with useFactory', async () => {
      module = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({
            load: [
              () => ({
                gitInfo: {
                  routePath: 'custom-path',
                  disableController: false,
                },
              }),
            ],
          }),
          GitInfoModule.registerAsync({
            imports: [ConfigModule],
            useFactory: (config: ConfigService) => ({
              routePath: config.get('gitInfo.routePath'),
              disableController: config.get('gitInfo.disableController'),
            }),
            inject: [ConfigService],
          }),
        ],
      }).compile();

      const controller = module.get(GitInfoController);
      const service = module.get(GitInfoService);
      const options = module.get(GIT_INFO_OPTIONS);

      expect(controller).toBeDefined();
      expect(service).toBeDefined();
      expect(options).toEqual({
        routePath: 'custom-path',
        disableController: false,
      });
    });

    it('should handle async factory errors', async () => {
      const errorFactory = async () => {
        throw new Error('Factory Error');
      };

      await expect(
        Test.createTestingModule({
          imports: [
            GitInfoModule.registerAsync({
              useFactory: errorFactory,
            }),
          ],
        }).compile()
      ).rejects.toThrow('Factory Error');
    });

    it('should handle missing injected dependencies', async () => {
      await expect(
        Test.createTestingModule({
          imports: [
            GitInfoModule.registerAsync({
              useFactory: (config: ConfigService) => ({}),
              inject: [ConfigService],
            }),
          ],
        }).compile()
      ).rejects.toThrow(Error);
    });
  });

  describe('route configuration', () => {
    it('should use custom route path', async () => {
      const module = await Test.createTestingModule({
        imports: [
          GitInfoModule.register({
            routePath: 'custom-path',
          }),
        ],
      }).compile();

      const controller = module.get(GitInfoController);
      const path = Reflect.getMetadata('path', controller.constructor);
      expect(path).toBe('custom-path');
    });
  });
});
