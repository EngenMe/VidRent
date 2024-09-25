const logger = require('../utils/logger');

require('express-async-errors');

module.exports = function () {
  process.on('uncaughtException', ex => {
    logger.error(ex.message, { metadata: ex });
    logger.on('finish', () => process.exit(1));
    logger.end();
  });

  process.on('unhandledRejection', ex => {
    logger.error(ex.message, { metadata: ex });
    logger.on('finish', () => process.exit(1));
    logger.end();
  });
};
