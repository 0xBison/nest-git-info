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
    process.env.NODE_ENV = 'production';
    (existsSync as jest.Mock).mockReturnValue(false);
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01'));
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.GITHUB_SHA;
    delete process.env.GITHUB_REF_NAME;
    delete process.env.NODE_ENV;
    delete process.env.GIT_INFO_SHA_VAR;
    delete process.env.GIT_INFO_BRANCH_VAR;
    delete process.env.GIT_INFO_ADD_ENVIRONMENT;
    jest.useRealTimers();
  });

  it('should generate build info with default GitHub vars', () => {
    generateBuildInfo();

    expect(writeFileSync).toHaveBeenCalledWith(
      expect.stringContaining('src/build-info.json'),
      expect.stringContaining('"githubSHA": "test-sha"')
    );
  });

  it('should use custom environment variable names', () => {
    process.env.GIT_INFO_SHA_VAR = 'CUSTOM_SHA';
    process.env.GIT_INFO_BRANCH_VAR = 'CUSTOM_BRANCH';
    process.env.CUSTOM_SHA = 'custom-sha';
    process.env.CUSTOM_BRANCH = 'custom-branch';

    generateBuildInfo();

    expect(writeFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('"githubSHA": "custom-sha"')
    );
  });

  it('should include additional environment variables', () => {
    process.env.GIT_INFO_ADD_ENVIRONMENT = 'NODE_ENV';
    process.env.GIT_INFO_ADD_CUSTOM = 'CUSTOM_VALUE';
    process.env.CUSTOM_VALUE = 'test-value';

    generateBuildInfo();

    expect(writeFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringMatching(/.*"ENVIRONMENT": "production".*/)
    );
    expect(writeFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringMatching(/.*"CUSTOM": "test-value".*/)
    );
  });

  it('should include package version', () => {
    generateBuildInfo();

    expect(writeFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringMatching(/"version": ".+"/)
    );
  });
});
