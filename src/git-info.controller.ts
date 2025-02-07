import { Controller, Get, Inject } from '@nestjs/common';
import { GitInfoService } from './git-info.service';
import { GIT_INFO_OPTIONS } from './git-info.constants';
import { GitInfoModuleOptions } from './git-info.options';

let ApiTags: (tag: string) => ClassDecorator = () => () => {};

try {
  ({ ApiTags } = require('@nestjs/swagger'));
} catch {
  // Swagger not installed, use dummy decorator
}

@ApiTags('git-info')
@Controller('git-info')
export class GitInfoController {
  constructor(
    private readonly gitInfoService: GitInfoService,
    @Inject(GIT_INFO_OPTIONS) private options: GitInfoModuleOptions
  ) {
    const controllerPath = options.routePath || 'git-info';
    const swaggerTag = options.swaggerTag || 'git-info';

    // Dynamically update decorators
    Reflect.defineMetadata('path', controllerPath, GitInfoController);
    if (!options.disableSwagger) {
      ApiTags(swaggerTag)(GitInfoController);
    }
  }

  @Get()
  getInfo() {
    return this.gitInfoService.getVersionInfo();
  }
}
