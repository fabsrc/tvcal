const BrowserSyncPlugin = require('browser-sync-webpack-plugin')

module.exports = {
  entry: './src/index',
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
  module: {
    rules: [
      {
        test: /\.tag$/,
        enforce: 'pre',
        exclude: /node_modules/,
        use: [{
          loader: 'riot-tag-loader'
        }]
      },
      {
        test: /\.js$|\.tag$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
}
