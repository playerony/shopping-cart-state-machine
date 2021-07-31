const devServerConfig = require('../dev-server/webpack.server.config');

module.exports = () => ({
  devServer: devServerConfig,
});
