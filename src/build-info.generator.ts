import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export function generateBuildInfo() {
  const buildInfo = {
    githubSHA: process.env.GITHUB_SHA || 'development',
    githubBranch: process.env.GITHUB_REF_NAME || 'development',
    buildTime: new Date().toISOString(),
  };

  // Write to src instead of dist
  const srcPath = join(process.cwd(), 'src');
  const buildInfoPath = join(srcPath, 'build-info.json');

  // Create src directory if it doesn't exist
  if (!existsSync(srcPath)) {
    mkdirSync(srcPath, { recursive: true });
  }

  // Write build info
  writeFileSync(buildInfoPath, JSON.stringify(buildInfo, null, 2));
}

// Run if called directly (not imported)
if (require.main === module) {
  generateBuildInfo();
}
