const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const ESLintPlugin = require('eslint-webpack-plugin');

require('dotenv').config();

const isDevelopment = process.env.REACT_CLICKER_APP_ENV === 'development';

console.table({
  mode: process.env.REACT_CLICKER_APP_ENV,
  isProd: process.env.REACT_CLICKER_APP_ENV === 'production',
  isDev: process.env.REACT_CLICKER_APP_ENV === 'development',
});

module.exports = {
  entry: './src/index.tsx',
  mode: isDevelopment ? 'development' : 'production',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isDevelopment ? '[name].bundle.js' : '[name].[contenthash].js',
    chunkFilename: isDevelopment
      ? '[name].chunk.bundle.js'
      : '[name].[contenthash].chunk.js',
    publicPath: '/',
  },
  devtool: isDevelopment ? 'eval-source-map' : 'source-map',
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.scss', '.json'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: './tsconfig.json',
      }),
    ],
    alias: {
      '@fonts': path.resolve(__dirname, 'src/@fonts'),
      '@styles': path.resolve(__dirname, 'src/styles'),
      '@app': path.resolve(__dirname, 'src/app'),
      '@types': path.resolve(__dirname, 'src/@types'),
      '@config': path.resolve(__dirname, 'src/config'),
      '@utils': path.resolve(__dirname, 'src/utils'),
    },
  },
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
      new CssMinimizerPlugin(),
    ],
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/,
        use: [
          'babel-loader',
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/,
        type: 'asset/resource',
        generator: {
          filename: 'assets/fonts/[name][hash:8][ext][query]',
        },
      },
      {
        test: /\.(sa|sc|c)ss$/,
        oneOf: [
          {
            test: /\.(module|md)\.scss$/,
            use: [
              MiniCssExtractPlugin.loader,
              'css-modules-typescript-loader',
              {
                loader: 'css-loader',
                options: {
                  modules: {
                    localIdentName: isDevelopment
                      ? '[local]--[hash:base64:6]'
                      : '[local]-[hash:base64:6]',
                    exportLocalsConvention: 'camelCaseOnly',
                  },
                },
              },
              {
                loader: 'sass-loader',
                options: {
                  sourceMap: isDevelopment,
                },
              },
            ],
          },
          {
            use: [
              isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
              {
                loader: 'css-loader',
                options: {
                  sourceMap: isDevelopment,
                },
              },
              {
                loader: 'sass-loader',
                options: {
                  sourceMap: isDevelopment,
                },
              },
            ],
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/images/[name][hash:8][ext][query]',
        },
      },
      {
        test: /\.json$/,
        type: 'javascript/auto',
        include: [path.resolve(__dirname, 'src/locales')],
        use: [
          {
            loader: 'file-loader',
            options: {
              name: '[name].[hash:8].[ext]',
              outputPath: 'locales',
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: isDevelopment ? '[name].css' : '[name].[contenthash].css',
      chunkFilename: isDevelopment ? '[id].css' : '[id].[contenthash].css',
    }),
    new Dotenv(),
    new CopyWebpackPlugin({
      patterns: [{ from: 'src/@fonts', to: 'assets/fonts' }],
    }),
    new ForkTsCheckerWebpackPlugin({
      async: isDevelopment,
      typescript: {
        configFile: './tsconfig.json',
      },
    }),
    new ESLintPlugin({
      extensions: ['ts', 'tsx', 'js', 'jsx'],
      context: path.resolve(__dirname, 'src'),
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    compress: true,
    port: 9000,
    historyApiFallback: true,
    client: {
      overlay: true,
    },
    devMiddleware: {
      publicPath: '/',
    },
    allowedHosts: 'all',
    hot: true,
  },
};
