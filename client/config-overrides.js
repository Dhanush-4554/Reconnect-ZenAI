const { override, addWebpackAlias, addWebpackPlugin } = require('customize-cra');
const path = require('path');
const webpack = require('webpack');

module.exports = override(
  addWebpackAlias({
    'stream': path.resolve(__dirname, 'node_modules/stream-browserify'),
    'buffer': path.resolve(__dirname, 'node_modules/buffer')
  }),
  addWebpackPlugin(
    new webpack.ProvidePlugin({
      Buffer: ['buffer', 'Buffer'],
    })
  )
);
