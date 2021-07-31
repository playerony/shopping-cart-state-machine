const path = require('path');
const webpackMerge = require('webpack-merge').default;
const HtmlWebpackPlugin = require('html-webpack-plugin');

const modeConfiguration = (env) => require(`./build-config/webpack.${env.mode}`)(env);

module.exports = ({ mode } = { mode: 'production' }) =>
  webpackMerge(
    {
      mode,
      entry: {
        app: [path.resolve('src/index.jsx')],
      },
      output: {
        filename: 'bundle.js',
      },
      resolve: {
        extensions: ['.js', '.jsx'],
      },
      module: {
        rules: [
          {
            test: /\.jsx?$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
          },
          {
            test: /\.css$/,
            use: [
              {
                loader: 'style-loader',
              },
              {
                loader: 'css-loader',
              },
            ],
          },
        ],
      },
      plugins: [
        new HtmlWebpackPlugin({
          template: './public/index.html',
        }),
      ],
    },
    modeConfiguration({ mode }),
  );
