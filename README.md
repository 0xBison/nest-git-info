# nest-git-info

A NestJS module that exposes Git build information via an API endpoint. Automatically captures and exposes Git metadata during your build process which is useful debugging which version of the code is running in live environments.

## Installation

```bash
npm install nest-git-info
```

## Quick Start

1. Install module in your code:

```typescript
import { GitInfoModule } from 'nest-git-info';

@Module({ imports: [GitInfoModule.register()] })
export class AppModule {}
```

2. Add a prebuild script (or to your existing prebuild script) so that the git environment details can be added at build time. By running this at build time, we avoid issues with docker cache layers in the `npm install`.

```json
{
  "scripts": {
    "prebuild": "nest-git-info",
    "build": "nest build"
  }
}
```

3. Make sure you have the following in your `nest-cli.json` to ensure the build info is compiled into the build output.

```json
  "assets": [
    "**/*.json"
  ]
```

like so:

```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "compilerOptions": {
    "deleteOutDir": true,
    "assets": [
      "**/*.json"
    ]
  }
}
```

The `prebuild` script will automatically run before your build, generating the Git information file. This works in both local development and CI/CD environments. For local builds you will just see a `development` default value since the github environment variables wont exist.

## Configuration

### Module Options

```typescript
GitInfoModule.register({
  // Controller configuration
  routePath: 'version',              // Default: 'git-info'
  swaggerTag: 'Version Info',        // Default: 'git-info'
  
  // Feature flags
  disableSwagger: false,             // Default: false
  disableController: false,          // Default: false
  
  // Environment variable configuration
  environmentVariables: {
    // Override default environment variable names
    gitSHA: 'CUSTOM_SHA_VAR',        // Default: 'GITHUB_SHA'
    gitBranch: 'CUSTOM_BRANCH_VAR',  // Default: 'GITHUB_REF_NAME'
    
    // Add custom environment variables
    additionalVars: {
      DEPLOY_ENVIRONMENT: 'NODE_ENV',
      CUSTOM_VAR: 'MY_CUSTOM_ENV_VAR',
    },
  },
  
  // Custom build info generator
  buildInfoGenerator: () => ({
    customField: 'value',
  }),
});
```

### Async Configuration

```typescript
GitInfoModule.registerAsync({
  useFactory: (configService: ConfigService) => ({
    disableController: configService.get('NODE_ENV') === 'production',
    routePath: configService.get('GIT_INFO_PATH'),
  }),
  inject: [ConfigService],
});
```

### Conditional Controller

You can conditionally enable/disable the controller based on your environment:

```typescript
GitInfoModule.register({
  disableController: process.env.NODE_ENV === 'production',
});

// Or use the service directly:
import { GitInfoService } from 'nest-git-info';

@Injectable()
export class MyService {
  constructor(private gitInfoService: GitInfoService) {}

  someMethod() {
    const buildInfo = this.gitInfoService.getVersionInfo();
    // Use build info...
  }
}
```

## GitHub Actions Integration

This package automatically works with GitHub Actions as it uses the following environment variables that GitHub Actions injects during builds:
GITHUB_SHA: The commit SHA that triggered the workflow
GITHUB_REF_NAME: The branch or tag name that triggered the workflow
These variables are automatically injected by GitHub Actions during the build process, so you don't need to configure anything special.

## API Response Example

```json
{
  "version": "1.0.0",
  "githubSHA": "a1b2c3d4e5f6...",
  "githubBranch": "main",
  "buildTime": "2024-01-01T00:00:00.000Z"
}
```

## Swagger Support

The module includes optional Swagger support. If you have @nestjs/swagger installed, the endpoint will be automatically documented. You can customize the Swagger tag:

```typescript
GitInfoModule.register({
  swaggerTag: 'Version Information',
});
```

If Swagger is not installed, the module will work normally without Swagger decorators.

## License

MIT
