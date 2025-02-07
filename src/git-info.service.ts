import { Injectable } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class GitInfoService {
  private getBuildInfo() {
    try {
      const buildInfoPath = join(process.cwd(), 'dist', 'build-info.json');
      return JSON.parse(readFileSync(buildInfoPath, 'utf8'));
    } catch (error) {
      return {
        githubSHA: 'unknown',
        githubBranch: 'unknown',
      };
    }
  }

  getVersionInfo() {
    const buildInfo = this.getBuildInfo();
    const packageJson = require(join(process.cwd(), 'package.json'));

    return {
      version: packageJson.version,
      ...buildInfo,
    };
  }
}