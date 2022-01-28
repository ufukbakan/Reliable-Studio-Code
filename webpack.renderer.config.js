const rules = require('./webpack.rules');

rules.push({
  test: /\.css$/,
  use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
});


console.error = (() => {
  const _error = console.error
  const re = /^Warning: Each child in an array or iterator should have a unique "key" prop/
  return (...args) => {
    const line = args[0]
    if (re.test(line)) {
      // Ignore key warnings
    } else {
      _error(...args)
    }
  }
})();

module.exports = {
  module: {
    rules,
  }
};
