const webpackMerge = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const isProduction = (process.env.NODE_ENV === 'production');

const commonConfig = {
  devtool: 'cheap-module-source-map',
  context: path.resolve(__dirname, './src'),
  entry: {
    app: './app.jsx',
    vendor: ['react-hot-loader/patch', 'react', 'react-dom', 'react-router'],
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: '[name].bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.jsx?/,
        exclude: [ /node_modules/ ],
        loader: 'babel-loader',
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ],
      },
      {
        test: /\.(sass|scss)$/,
        use: [
          'style-loader',
          'css-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.less$/,
        use: [ 'style-loader', 'less-loader' ],
      },
    ],
  },
  plugins: [
    // split out our specified vendor scripts
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      filename: '[name].[hash].js',
      minChunks: Infinity,
    }),
    // make sure Javascript files are being called from our index.html
    // !!html-loader! added to avoid conflict with html-loader
    new HtmlWebpackPlugin({
      hash: true,
      template: path.resolve(__dirname, './src/index.html'),
      inject: 'body',
    }),
    new webpack.NamedModulesPlugin(),
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
    modules: [path.resolve(__dirname, './src'), 'node_modules'],
  },
};

if (isProduction) {
  module.exports = function(env) {
    return webpackMerge(commonConfig, {
      plugins: [
        new webpack.LoaderOptionsPlugin({
          minimize: true,
          debug: false
        }),
        new webpack.DefinePlugin({
          'process.env': {
            'NODE_ENV': JSON.stringify('production')
          }
        }),
        new webpack.optimize.UglifyJsPlugin({
          beautify: false,
          mangle: {
            screw_ie8: true,
            keep_fnames: true
          },
          compress: {
            screw_ie8: true
          },
          comments: false
        })
      ]
    })
  }
} else {
  module.exports = function(env) {
    return webpackMerge(commonConfig, {
      devServer: {
        hot: true,
        contentBase: path.resolve(__dirname, './src'),
      }
    })
  }
}

