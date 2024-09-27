const config = require('config');
const Fawn = require('fawn');
const mongoose = require('mongoose');

const logger = require('../utils/logger');

module.exports = function () {
  const db = config.get('db');
  mongoose
    .connect(db)
    .then(() => logger.info(`Connected to ${db} successfully...`));

  Fawn.init(mongoose);
};
