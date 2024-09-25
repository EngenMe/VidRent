const Fawn = require('fawn');
const mongoose = require('mongoose');

const logger = require('../utils/logger');

module.exports = function () {
  mongoose
    .connect('mongodb://localhost/vidly')
    .then(() => logger.info('DB connected successfully...'));

  Fawn.init(mongoose);
};
