import { Test, TestingModule } from '@nestjs/testing';
import { GitInfoService } from './git-info.service';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

describe('GitInfoService', () => {
  let service: GitInfoService;

  beforeEach(async () => {
    // Create mock build info file
    const distPath = join(process.cwd(), 'dist');
    mkdirSync(distPath, { recursive: true });
    writeFileSync(
      join(distPath, 'build-info.json'),
      JSON.stringify({
        githubSHA: 'test-sha',
        githubBranch: 'test-branch',
      })
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [GitInfoService],
    }).compile();

    service = module.get<GitInfoService>(GitInfoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return version info with build details', () => {
    const info = service.getVersionInfo();
    expect(info).toHaveProperty('githubSHA', 'test-sha');
    expect(info).toHaveProperty('githubBranch', 'test-branch');
    expect(info).toHaveProperty('version');
  });

  it('should handle missing build info file', () => {
    // Delete the build info file
    const buildInfoPath = join(process.cwd(), 'dist', 'build-info.json');
    try {
      require('fs').unlinkSync(buildInfoPath);
    } catch {}

    const info = service.getVersionInfo();
    expect(info).toHaveProperty('githubSHA', 'unknown');
    expect(info).toHaveProperty('githubBranch', 'unknown');
  });
});
