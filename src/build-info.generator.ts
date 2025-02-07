import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import { GitInfoModuleOptions } from './git-info.options';

export function generateBuildInfo(options: GitInfoModuleOptions = {}) {
  // Get environment variable names from options or use defaults
  const {
    gitSHA = 'GITHUB_SHA',
    gitBranch = 'GITHUB_REF_NAME',
    additionalVars = {},
  } = options.environmentVariables || {};

  // Build the base info
  const buildInfo = {
    githubSHA: process.env[gitSHA] || 'development',
    githubBranch: process.env[gitBranch] || 'development',
    buildTime: new Date().toISOString(),
  };

  // Add additional environment variables
  const additionalInfo = Object.entries(additionalVars).reduce(
    (acc, [key, envVar]) => ({
      ...acc,
      [key]: process.env[envVar] || 'unknown',
    }),
    {}
  );

  // Merge with custom build info if provided
  const customInfo = options.buildInfoGenerator
    ? options.buildInfoGenerator()
    : {};

  const finalBuildInfo = {
    ...buildInfo,
    ...additionalInfo,
    ...customInfo,
  };

  // Write to src instead of dist
  const srcPath = join(process.cwd(), 'src');
  const buildInfoPath = join(srcPath, 'build-info.json');

  // Create src directory if it doesn't exist
  if (!existsSync(srcPath)) {
    mkdirSync(srcPath, { recursive: true });
  }

  // Write build info
  writeFileSync(buildInfoPath, JSON.stringify(finalBuildInfo, null, 2));
}
