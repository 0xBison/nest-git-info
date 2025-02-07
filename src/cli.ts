#!/usr/bin/env node
import { generateBuildInfo } from './build-info.generator';
import { GIT_INFO_OPTIONS } from './git-info.constants';
import { GitInfoModuleOptions } from './git-info.options';

let options: GitInfoModuleOptions;
try {
  options = require(process.cwd()).get(GIT_INFO_OPTIONS);
} catch {
  options = {};
}

generateBuildInfo(options);
