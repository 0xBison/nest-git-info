import { generateBuildInfo } from './build-info.generator';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  writeFileSync: jest.fn(),
  mkdirSync: jest.fn(),
  existsSync: jest.fn(),
}));

describe('CLI', () => {
  const writeFileSync = jest.spyOn(require('fs'), 'writeFileSync');

  beforeEach(() => {
    process.env.GITHUB_SHA = 'test-sha';
    process.env.GITHUB_REF_NAME = 'test-branch';
    (existsSync as jest.Mock).mockReturnValue(false);
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01'));
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.GITHUB_SHA;
    delete process.env.GITHUB_REF_NAME;
    jest.useRealTimers();
  });

  it('should generate build info file', () => {
    generateBuildInfo();

    expect(existsSync).toHaveBeenCalled();
    expect(writeFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('"githubSHA": "test-sha"')
    );
  });

  it('should use default values when env vars not present', () => {
    delete process.env.GITHUB_SHA;
    delete process.env.GITHUB_REF_NAME;

    generateBuildInfo();

    expect(writeFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('"githubSHA": "development"')
    );
  });
});
