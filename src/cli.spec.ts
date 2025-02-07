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
    process.env.CUSTOM_VAR = 'custom-value';
    (existsSync as jest.Mock).mockReturnValue(false);
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-01'));
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.GITHUB_SHA;
    delete process.env.GITHUB_REF_NAME;
    delete process.env.NODE_ENV;
    delete process.env.CUSTOM_VAR;
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

  it('should use custom environment variable names', () => {
    generateBuildInfo({
      environmentVariables: {
        gitSHA: 'CUSTOM_SHA',
        gitBranch: 'CUSTOM_BRANCH',
      },
    });

    process.env.CUSTOM_SHA = 'custom-sha';
    process.env.CUSTOM_BRANCH = 'custom-branch';

    generateBuildInfo({
      environmentVariables: {
        gitSHA: 'CUSTOM_SHA',
        gitBranch: 'CUSTOM_BRANCH',
      },
    });

    expect(writeFileSync).toHaveBeenLastCalledWith(
      expect.any(String),
      expect.stringContaining('"githubSHA": "custom-sha"')
    );
  });

  it('should include additional environment variables', () => {
    generateBuildInfo({
      environmentVariables: {
        additionalVars: {
          ENVIRONMENT: 'NODE_ENV',
          CUSTOM_FIELD: 'CUSTOM_VAR',
        },
      },
    });

    expect(writeFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringMatching(/.*"ENVIRONMENT": "production".*/)
    );
    expect(writeFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringMatching(/.*"CUSTOM_FIELD": "custom-value".*/)
    );
  });

  it('should use custom build info generator', () => {
    generateBuildInfo({
      buildInfoGenerator: () => ({
        customField: 'test-value',
        nested: { value: 123 },
      }),
    });

    expect(writeFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringMatching(/.*"customField": "test-value".*/)
    );
    expect(writeFileSync).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringMatching(/.*"nested": {\s*"value": 123\s*}.*/)
    );
  });
});
