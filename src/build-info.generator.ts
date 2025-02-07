import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export function generateBuildInfo() {
  // Get package version
  const packageJson = require(join(process.cwd(), 'package.json'));

  // Get environment variable names or use defaults
  const gitSHAVar = process.env.GIT_INFO_SHA_VAR || 'GITHUB_SHA';
  const gitBranchVar = process.env.GIT_INFO_BRANCH_VAR || 'GITHUB_REF_NAME';

  // Build the base info
  const buildInfo = {
    version: packageJson.version,
    githubSHA: process.env[gitSHAVar] || 'development',
    githubBranch: process.env[gitBranchVar] || 'development',
    buildTime: new Date().toISOString(),
  };

  // Add additional environment variables
  const additionalInfo = parseAdditionalVarsFromEnv();

  const finalBuildInfo = {
    ...buildInfo,
    ...additionalInfo,
  };

  // Write to src directory
  const srcPath = join(process.cwd(), 'src');
  const buildInfoPath = join(srcPath, 'build-info.json');

  // Create src directory if it doesn't exist
  if (!existsSync(srcPath)) {
    mkdirSync(srcPath, { recursive: true });
  }

  // Write build info
  writeFileSync(buildInfoPath, JSON.stringify(finalBuildInfo, null, 2));
}

function parseAdditionalVarsFromEnv() {
  const prefix = 'GIT_INFO_ADD_';
  return Object.entries(process.env)
    .filter(([key]) => key.startsWith(prefix))
    .reduce(
      (acc, [key, envVarName]) => ({
        ...acc,
        [key.replace(prefix, '')]: process.env[envVarName] || 'unknown',
      }),
      {}
    );
}
