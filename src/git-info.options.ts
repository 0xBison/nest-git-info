import { Type, DynamicModule } from '@nestjs/common';

export interface GitInfoModuleOptions {
  // Controller options
  routePath?: string; // Default: 'git-info'
  swaggerTag?: string; // Default: 'git-info'

  // Enable/disable features
  disableSwagger?: boolean;
  disableController?: boolean; // If true, only service is available

  // Custom environment variables
  environmentVariables?: {
    // Built-in vars - override default env var names
    gitSHA?: string; // Default: 'GITHUB_SHA'
    gitBranch?: string; // Default: 'GITHUB_REF_NAME'

    // Custom vars - add your own
    additionalVars?: Record<string, string>;
  };

  // Custom build info generator
  buildInfoGenerator?: () => Record<string, any>;
}

export interface GitInfoModuleAsyncOptions {
  imports?: Array<Type<any> | DynamicModule>;
  useFactory: (
    ...args: any[]
  ) => Promise<GitInfoModuleOptions> | GitInfoModuleOptions;
  inject?: any[];
}
