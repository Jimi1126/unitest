# Unitest

一个 cli 工具，通过注解生成单元测试，让单元测试变得简单。

## 安装

```shell
npm i unitest -g
```

## 快速开始

在需要生成单元测试的文件里，为函数添加单元测试注解，然后告诉 unitest 文件在哪里并运行，当运行完毕在项目的根目录下就多了一个 test 目录，里面就是生成的单元测试了。

1. **示例：demo.js**

```js
/**
 * 返回两数相加结果
 * @param {Number} a
 * @param {Number} b
 * @return {Number}
 * @test 1|2 3
 */
exports.add = function (a, b) {
  return a + b;
};
```

假设目录结构是这样的
![1712396079101.png](/file/img/fI85rn09xfX60iNOtmUtA.png)

```shell
unitest -f src/demo.js
```

![1712398185730.png](/file/img/GaSYS8lZwumr2XKxuSzxI.png)
可以看到，项目添加了一个 test 目录，并且生成两个测试文件，为什么是两个？考虑到会有自定义单元测试的情况，避免覆盖，我们把自定义的测试代码放在.test.js 文件里，.test.js 文件只会生成一次，而.unitest.js 总是会重新生成。

现在运行测试工具，就可以看到函数完成了单元测试。

![image.png](/file/img/fSbsQ9fkTwktaoXMUJ256.png)

## 说明

### 注释

unitest 会检查所有添加@test 注释的函数

```js
// 1、只添加@test，会生成单元测试，单元测试代码无参数传入
/**
 * @test
 */
exports.add = function (a, b) {
  return a + b;
};
// 2、添加@test与@param，会生成单元测试，并且单元测试代码根据@param类型mock参数传入
/**
 * 返回两数相加结果
 * @param {Number} a
 * @param {Number} b
 * @test
 */
exports.add = function (a, b) {
  return a + b;
};
// 3、添加@test并描述输入（以|隔开）与输出（与输入以空格隔开），会生成单元测试，单元测试代码会根据描述生成输入输出
// 注意：这样注释都将被解析成String
/**
 * 返回两数相加结果
 * @test 1|2 3
 */
exports.add = function (a, b) {
  return a + b;
};
// 4、为了支持输入输出类型，需要添加@param与@return来定义输入与输出类型
/**
 * 返回两数相加结果
 * @param {Number} a
 * @param {Number} b
 * @return {Number}
 * @test 1|2 3
 */
exports.add = function (a, b) {
  return a + b;
};
```

### options

支持指定目标目录与指定生成目录，当前只支持.js 后缀

```shell
Options:
  -v, --version          当前版本
  -f, --from <dir|file>  指定目标目录或文件 (default: "src")
  -t, --to <dir>         指定生成目录 (default: "test")
  -e, --ext <suffix>     指定目标文件后缀 (default: ".js")
  -c, --config <file>    指定配置文件
  -h, --help             display help for command
```
