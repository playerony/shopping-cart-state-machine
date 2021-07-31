const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = () => ({
  output: {
    filename: './[id].[chunkhash].js',
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [{ from: 'public', to: 'public' }],
    }),
  ],
});
