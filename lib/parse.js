const bbParser = require('@babel/parser');

function parser(code = '', options) {
  const fnComments = [];
  const rootNode = bbParser.parse(code, options);
  const body = rootNode.program.body || [];
  body.forEach((node) => {
    if (node.leadingComments) {
      const fnComment = readComment(
        node.leadingComments[node.leadingComments.length - 1].value
      );
      if (fnComment.testable) {
        if (node.type == 'FunctionDeclaration') {
          fnComments.push({
            name: node.id.name,
            ...fnComment,
          });
        } else if (
          node.type == 'ExpressionStatement' &&
          node.expression.right.type == 'FunctionExpression'
        ) {
          fnComments.push({
            name: node.expression.left.property.name,
            ...fnComment,
          });
        }
      }
    }
  });
  return fnComments;
}

function readComment(text) {
  let testable = false,
    mock = true,
    params = [],
    res = undefined,
    resType = undefined;
  if (text && /@test/.test(text)) {
    testable = true;
    params = (text.match(/@param.*/g) || []).map((s) => {
      const ps = s.match(/\S+/g);
      ps.shift();
      return {
        type: ps.shift().match(/\w+/).toString(),
        name: ps.shift(),
        desc: ps.join(),
      };
    });
    if (/@test\s\S+/.test(text)) {
      mock = false;
      (text.match(/@test.*/g) || []).map((s) => {
        const ps = s.match(/\S+/g);
        ps.shift();
        ps.shift()
          .split('|')
          .forEach((param, i) => {
            params[i] = params[i] || { name: 'param' + i };
            params[i].default = JSON.stringify(param);
          });
        res = JSON.stringify(ps.shift());
      });
    }
    if (/@return\s\S+/.test(text)) {
      (text.match(/@return.*/g) || []).map((s) => {
        const ps = s.match(/\S+/g);
        ps.shift();
        resType = ps.shift().match(/\w+/).toString();
      });
    }
  }
  return { testable, mock, params, res, resType };
}

module.exports = parser;
