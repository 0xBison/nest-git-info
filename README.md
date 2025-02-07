# nest-git-info

A NestJS module that exposes Git build information via an API endpoint. Automatically captures and exposes Git metadata during your build process which is useful for debugging which version of the code is running in live environments.

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

3. Add the build info file to your `.gitignore`:

```gitignore
src/build-info.json
```

4. Make sure you have the following in your `nest-cli.json` to ensure the build info is compiled into the build output:

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

### Environment Variables

The module uses environment variables for configuration:

1. Git Information Variables (defaults):

- `GITHUB_SHA` - The commit SHA
- `GITHUB_REF_NAME` - The branch name

2. Override Default Variable Names:

- `GIT_INFO_SHA_VAR` - Override the SHA environment variable name
- `GIT_INFO_BRANCH_VAR` - Override the branch environment variable name

3. Additional Custom Variables:

- `GIT_INFO_ADD_*` - Add custom environment variables to the output
  Example: `GIT_INFO_ADD_ENVIRONMENT=NODE_ENV` will add the NODE_ENV value to the output

### Example Usage

Basic setup with GitHub Actions (uses default environment variables):

```typescript
@Module({
  imports: [GitInfoModule.register()]
})
export class AppModule {}
```

### Example Usage - Runtime Controller Configuration

While environment variables control the build information, you might want to configure how the API endpoint behaves at runtime. For this, use `registerAsync`:

```typescript
@Module({
  imports: [
    ConfigModule.forRoot(),
    GitInfoModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        // Disable the controller in production
        disableController: configService.get('NODE_ENV') === 'production',
        // Use a custom endpoint path from configuration
        routePath: configService.get('GIT_INFO_PATH') || 'git-info',
        // Disable Swagger in production
        disableSwagger: configService.get('NODE_ENV') === 'production'
      }),
      inject: [ConfigService],
    }),
  ]
})
export class AppModule {}
```

This allows you to:
- Configure the API endpoint path dynamically
- Enable/disable the controller based on environment
- Control Swagger documentation
- Integrate with your application's configuration system (ConfigService, etc.)

Custom environment variables examples:

```bash
# In your CI/CD environment or .env file
GIT_INFO_SHA_VAR=CUSTOM_SHA
GIT_INFO_BRANCH_VAR=CUSTOM_BRANCH
GIT_INFO_ADD_ENVIRONMENT=NODE_ENV
GIT_INFO_ADD_REGION=AWS_REGION
```

### API Response Example

```json
{
  "version": "1.0.0",
  "githubSHA": "a1b2c3d4e5f6...",
  "githubBranch": "main",
  "buildTime": "2024-01-01T00:00:00.000Z",
  "ENVIRONMENT": "production",
  "REGION": "us-east-1"
}
```

## GitHub Actions Integration

This package automatically works with GitHub Actions as it uses the default environment variables that GitHub Actions injects during builds:

- `GITHUB_SHA`: The commit SHA that triggered the workflow
- `GITHUB_REF_NAME`: The branch or tag name that triggered the workflow

For local development, these values will default to "development" if the environment variables aren't present.

## Swagger Support

The module includes Swagger support out of the box if you have `@nestjs/swagger` installed. The endpoint will be automatically documented under the 'git-info' tag.

## License

MIT
