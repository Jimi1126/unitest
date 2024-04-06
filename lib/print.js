const chalk = require('chalk');
const ora = require('ora');

const LOG = console.log;
const SUCCESS = chalk.bold.green;
const INFO = chalk.bold.cyan;
const WARNING = chalk.bold.yellow;
const ERROR = chalk.bold.red;
const PROGRESS = (msg = '') => {
  return ora({
    text: INFO(msg),
    hideCursor: true,
  });
};

module.exports = {
  LOG,
  SUCCESS,
  INFO,
  WARNING,
  ERROR,
  PROGRESS,
};
