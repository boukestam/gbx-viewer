const webpack = require("webpack");
module.exports = function override(config) {
  const fallback = config.resolve.fallback || {};
  Object.assign(fallback, {
    fs: false,
    path: false,
    assert: require.resolve("assert"),
    zlib: require.resolve("browserify-zlib"),
    crypto: require.resolve("crypto-browserify"),
    stream: require.resolve("stream-browserify"),
  });

  config.resolve.fallback = fallback;
  config.plugins = (config.plugins || []).concat([
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
  ]);
  return config;
};
