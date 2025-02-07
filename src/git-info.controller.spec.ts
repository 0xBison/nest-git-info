import { Test, TestingModule } from '@nestjs/testing';
import { GitInfoController } from './git-info.controller';
import { GitInfoService } from './git-info.service';
import { GIT_INFO_OPTIONS } from './git-info.constants';

describe('GitInfoController', () => {
  let controller: GitInfoController;
  let service: GitInfoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GitInfoController],
      providers: [
        {
          provide: GitInfoService,
          useValue: {
            getVersionInfo: jest.fn().mockReturnValue({
              version: '1.0.0',
              githubSHA: 'test-sha',
              githubBranch: 'test-branch',
            }),
          },
        },
        {
          provide: GIT_INFO_OPTIONS,
          useValue: {
            routePath: 'git-info',
            swaggerTag: 'git-info',
          },
        },
      ],
    }).compile();

    controller = module.get<GitInfoController>(GitInfoController);
    service = module.get<GitInfoService>(GitInfoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return version info', () => {
    const result = controller.getInfo();
    expect(result).toEqual({
      version: '1.0.0',
      githubSHA: 'test-sha',
      githubBranch: 'test-branch',
    });
    expect(service.getVersionInfo).toHaveBeenCalled();
  });
});
