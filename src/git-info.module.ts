import { DynamicModule, Module } from '@nestjs/common';
import { GitInfoController } from './git-info.controller';
import { GitInfoService } from './git-info.service';
import {
  GitInfoModuleOptions,
  GitInfoModuleAsyncOptions,
} from './git-info.options';
import { GIT_INFO_OPTIONS } from './git-info.constants';

@Module({})
export class GitInfoModule {
  static register(options: GitInfoModuleOptions = {}): DynamicModule {
    return {
      module: GitInfoModule,
      providers: [
        {
          provide: GIT_INFO_OPTIONS,
          useValue: options,
        },
        GitInfoService,
      ],
      controllers: options.disableController ? [] : [GitInfoController],
      exports: [GitInfoService],
    };
  }

  static registerAsync(options: GitInfoModuleAsyncOptions): DynamicModule {
    return {
      module: GitInfoModule,
      imports: options.imports || [],
      providers: [
        {
          provide: GIT_INFO_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        GitInfoService,
      ],
      controllers: [GitInfoController],
      exports: [GitInfoService],
    };
  }
}
