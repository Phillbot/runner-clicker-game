const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const TsconfigPathsPlugin = require('tsconfig-paths-webpack-plugin');

const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  entry: './src/index.tsx',
  mode: isProduction ? 'production' : 'development',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: isProduction ? '[name].[contenthash].js' : '[name].bundle.js',
    chunkFilename: isProduction
      ? '[name].[contenthash].chunk.js'
      : '[name].chunk.bundle.js',
    publicPath: '/',
  },
  devtool: isProduction ? false : 'source-map',
  resolve: {
    extensions: ['.tsx', '.ts', '.js', '.scss'],
    plugins: [
      new TsconfigPathsPlugin({
        configFile: './tsconfig.json',
      }),
    ],
    alias: {
      '@fonts': path.resolve(__dirname, 'src/@fonts'),
      '@styles': path.resolve(__dirname, 'src/@styles'),
      '@common': path.resolve(__dirname, 'src/common'),
      '@app': path.resolve(__dirname, 'src/app'),
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
              isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
              'css-modules-typescript-loader',
              {
                loader: 'css-loader',
                options: {
                  modules: {
                    localIdentName: isProduction
                      ? '[local]-[hash:base64:6]'
                      : '[local]--[hash:base64:6]',
                    exportLocalsConvention: 'camelCaseOnly',
                  },
                },
              },
              {
                loader: 'sass-loader',
                options: {
                  sourceMap: !isProduction,
                },
              },
            ],
          },
          {
            use: [
              isProduction ? MiniCssExtractPlugin.loader : 'style-loader',
              {
                loader: 'css-loader',
                options: {
                  sourceMap: !isProduction,
                },
              },
              {
                loader: 'sass-loader',
                options: {
                  sourceMap: !isProduction,
                },
              },
            ],
          },
        ],
      },
      {
        test: /\.(png|svg|jpg|gif|woff|woff2|eot|ttf|otf)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024,
          },
        },
        generator: {
          filename: 'assets/[name][hash:8][ext][query]',
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
    }),
    new CleanWebpackPlugin(),
    new MiniCssExtractPlugin({
      filename: isProduction ? '[name].[contenthash].css' : '[name].css',
      chunkFilename: isProduction ? '[id].[contenthash].css' : '[id].css',
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
      overlay: {
        errors: true,
        warnings: false,
      },
    },
    devMiddleware: {
      publicPath: '/',
    },
    allowedHosts: 'all',
  },
};
