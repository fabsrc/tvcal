const BrowserSyncPlugin = require('browser-sync-webpack-plugin')

module.exports = {
  entry: './app/index',
  output: {
    path: `${__dirname}/public`,
    filename: 'bundle.js'
  },
  plugins: [
    new BrowserSyncPlugin({
      proxy: `http://localhost:${process.env.PORT || 5000}`,
      files: [`${__dirname}/public/*.*`]
    })
  ],
  externals: {
    'riot': 'riot'
  },
  module: {
    rules: [
      { test: /\.tag$/, enforce: 'pre', exclude: /node_modules/, loader: 'riot-tag-loader' },
      { test: /\.js$|\.tag$/, loader: 'babel-loader', options: { presets: ['es2015'] } }
    ]
  }
}
