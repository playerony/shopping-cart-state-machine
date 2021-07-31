const webpackMerge = require('webpack-merge').default;
const HtmlWebpackPlugin = require('html-webpack-plugin');

const modeConfiguration = (env) => require(`./build-config/webpack.${env.mode}`)(env);

module.exports = ({ mode } = { mode: 'production' }) =>
  webpackMerge(
    {
      mode,
      output: {
        filename: 'bundle.js',
      },
      module: {
        rules: [
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
