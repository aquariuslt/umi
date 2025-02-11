import { runCLI } from 'jest';
// @ts-ignore
import { createDebug, mergeConfig } from '@umijs/utils';
import { options as CliOptions } from 'jest-cli/build/cli/args';
import assert from 'assert';
import { join } from 'path';
import { existsSync } from 'fs';
import createDefaultConfig from './createDefaultConfig/createDefaultConfig';
import { IUmiTestArgs, PickedJestCliOptions } from './types';
import { loadTSConfigFile } from './utils';

const debug = createDebug('umi:test');

export * from './utils';

export default async function (args: IUmiTestArgs) {
  process.env.NODE_ENV = 'test';

  if (args.debug) {
    createDebug.enable('umi:test');
  }

  debug(`args: ${JSON.stringify(args)}`);

  // Print related versions
  if (args.version) {
    console.log(`umi-test@${require('../package.json').version}`);
    console.log(`jest@${require('jest/package.json').version}`);
    return;
  }

  const cwd = args.cwd || process.cwd();

  // Read config from cwd/jest.config.ts or cwd/jest.config.js
  const userJestConfigTsFile = join(cwd, 'jest.config.ts');
  const userJestConfigTsFileExists = existsSync(userJestConfigTsFile);

  let userJestConfigTs = Object.create({});
  if (userJestConfigTsFileExists) {
    try {
      userJestConfigTs = await loadTSConfigFile(userJestConfigTsFile);
      debug(`config from jest.config.ts: ${JSON.stringify(userJestConfigTs)}`);
    } catch (loadTsFileError) {
      throw loadTsFileError;
    }
  }

  const userJestConfigFile = join(cwd, 'jest.config.js');
  const userJestConfig =
    existsSync(userJestConfigFile) && require(userJestConfigFile);
  debug(`config from jest.config.js: ${JSON.stringify(userJestConfig)}`);

  // Read jest config from package.json
  const packageJSONPath = join(cwd, 'package.json');
  const packageJestConfig =
    existsSync(packageJSONPath) && require(packageJSONPath).jest;
  debug(`jest config from package.json: ${JSON.stringify(packageJestConfig)}`);

  // Merge configs
  // user config and args config could have value function for modification
  const config = mergeConfig(
    createDefaultConfig(cwd, args),
    packageJestConfig,
    userJestConfigTs,
    userJestConfig,
  );
  debug(`final config: ${JSON.stringify(config)}`);

  // Generate jest options
  const argsConfig = Object.keys(CliOptions).reduce((prev, name) => {
    if (args[name]) prev[name] = args[name];

    // Convert alias args into real one
    const { alias } = CliOptions[name];
    if (alias && args[alias]) prev[name] = args[alias];
    return prev;
  }, {} as PickedJestCliOptions);
  debug(`config from args: ${JSON.stringify(argsConfig)}`);

  // Run jest
  const result = await runCLI(
    {
      // @ts-ignore
      _: args._ || [],
      // @ts-ignore
      $0: args.$0 || '',
      // 必须是单独的 config 配置，值为 string，否则不生效
      // @ts-ignore
      config: JSON.stringify(config),
      ...argsConfig,
    },
    [cwd],
  );
  debug(result);

  // Throw error when run failed
  assert(result.results.success, `Test with jest failed`);
}
