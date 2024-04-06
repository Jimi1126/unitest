#!/usr/bin/env node
const { program } = require('commander');
const chalk = require('chalk');
const path = require('path');
const unitest = require('./unitest');
const pkg = require('../package.json');
const { LOG, INFO, ERROR } = require('./print');

program.version(pkg.version, '-v, --version', '当前版本');

program
  .option('-f, --from <dir|file>', '指定目标目录或文件', 'src')
  .option('-t, --to <dir>', '指定生成目录', 'test')
  .option('-e, --ext <suffix>', '指定目标文件后缀', '.js')
  .option('-c, --config <file>', '指定配置文件');

program.parse();

const options = program.opts();

if (options.config) {
  try {
    // eslint-disable-next-line no-undef
    const config = require(path.resolve(process.cwd(), options.config));
    if (!config.from && !config.to && !config.ext)
      throw new Error('无效的配置文件，请至少配置form/to/ext中的一项。');
    for (const k in config) config[k] && (options[k] = config[k]);
  } catch (err) {
    LOG(ERROR(err));
  }
}
LOG(
  INFO(
    `目标：${options.from}，规则：${options.ext}，生成单元测试在${options.to}目录`
  )
);

try {
  unitest(options);
} catch (err) {
  LOG(chalk.bold.red(err));
}
