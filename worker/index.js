// eslint-disable-next-line
const { runAsWorker } = require('synckit');
// eslint-disable-next-line
const { BladeFormatter } = require('blade-formatter');

runAsWorker(async (text, options) => {
  const result = await new BladeFormatter(options).format(text);
  return result;
});
