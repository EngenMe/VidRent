const config = require('config');

const app = require('./app');
const logger = require('./utils/logger');

const port = config.get('port');
const server = app.listen(port, () => {
  logger.info(`Listening to port ${port}`);
});

module.exports = server;
