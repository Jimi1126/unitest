/* eslint-disable no-undef */
const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');
const ejs = require('ejs');
const parser = require('./parse');
const { LOG, SUCCESS, INFO, WARNING, ERROR, PROGRESS } = require('./print');

const _PG_ = PROGRESS();

function getResolveFileNames(resolve_path, ext = '') {
  const fileNames = [];
  try {
    const stat = fs.statSync(resolve_path);
    if (stat.isFile()) {
      const fileName = path.parse(resolve_path);
      fileName.ext === ext && fileNames.push(fileName);
      _PG_.text = INFO('找到文件' + resolve_path);
    }
    if (stat.isDirectory()) {
      fs.readdirSync(resolve_path).forEach((item) => {
        Array.prototype.push.apply(
          fileNames,
          getResolveFileNames(path.resolve(resolve_path, item), ext)
        );
      });
    }
  } catch (err) {
    _PG_.fail(ERROR('寻找文件' + resolve_path + '，' + err));
  }
  return fileNames;
}

/**
 * 构建单元测试文件
 * @param {*} fileName
 * @param {*} options
 */
async function buildUnitest(fileName, options) {
  const fullFileName = path.join(fileName.dir, fileName.base);
  const relpath = path
    .relative(process.cwd(), fileName.dir)
    .split(path.sep)
    .slice(1)
    .join(path.sep);
  const unitestFileName = path.resolve(
    options.to,
    relpath,
    fileName.name + '.unitest.js'
  );
  const fnComments = parser(fs.readFileSync(fullFileName).toString());
  await build(
    path.resolve(__dirname, '../template/unitest.ejs'),
    unitestFileName,
    {
      fnComments,
      targetFileName: path.relative(
        path.parse(unitestFileName).dir,
        fullFileName
      ),
    }
  );
}

/**
 * 构建测试目标运行文件
 * @param {*} fileName
 * @param {*} options
 */
async function buildTest(fileName, options) {
  const thep = PROGRESS();
  thep.prefixText = '  ';
  const fullFileName = path.join(fileName.dir, fileName.base);
  const relpath = path
    .relative(process.cwd(), fileName.dir)
    .split(path.sep)
    .slice(1)
    .join(path.sep);
  const testFileName = path.resolve(
    options.to,
    relpath,
    fileName.name + '.test.js'
  );
  await new Promise((resolve, reject) => {
    fs.readFile(testFileName, async (err) => {
      // 不存在生成，存在则跳过
      if (err) {
        try {
          await build(
            path.resolve(__dirname, '../template/test.ejs'),
            testFileName,
            {
              targetFileName: path.relative(
                path.parse(testFileName).dir,
                fullFileName
              ),
              unitestFileName: './'.concat(fileName.name).concat('.unitest.js'),
              targetName: path.join(
                path.relative(process.cwd(), fileName.dir),
                fileName.base
              ),
            }
          );
          resolve();
        } catch (err) {
          reject(err);
        }
      } else {
        thep.info(WARNING('跳过生成文件' + testFileName));
        resolve();
      }
    });
  });
}

/**
 * 根据模板渲染文件，并生成
 * @param {*} path
 * @param {*} options
 */
async function build(ejsFileName, outFileName, options) {
  const thep = PROGRESS();
  thep.prefixText = '  ';
  thep.start(SUCCESS('生成文件' + outFileName));
  try {
    const res = await new Promise((resolve, reject) => {
      ejs.renderFile(ejsFileName, options, (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });
    mkdirp.sync(path.dirname(outFileName));
    fs.writeFileSync(outFileName, res, 'utf-8');
    thep.succeed(SUCCESS('生成文件' + outFileName));
  } catch (err) {
    thep.fail(ERROR('生成文件' + outFileName + '，' + err));
  }
}

async function unitest(options = {}) {
  const fileNames = getResolveFileNames(options.from, options.ext);
  _PG_.succeed(SUCCESS(`共寻找到${fileNames.length}个文件`));
  let s_count = 0,
    f_count = 0;
  for (let i = 0; i < fileNames.length; i++) {
    const fileName = fileNames[i];
    _PG_.succeed(SUCCESS(path.join(fileName.dir, fileName.base)));
    try {
      await buildUnitest(fileName, options);
      await buildTest(fileName, options);
      s_count++;
    } catch (err) {
      f_count++;
      _PG_.fail(ERROR(err));
    }
  }
  LOG(INFO(`生成单元测试完成，成功${s_count}个，失败${f_count}个。`));
}

module.exports = unitest;
