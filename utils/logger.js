const winston = require('winston');
require('winston-mongodb');

module.exports = winston.createLogger({
  level: 'error',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] })
  ),
  transports: [
    new winston.transports.File({ filename: 'logfile.log' }),
    new winston.transports.MongoDB({
      db: 'mongodb://localhost/vidly',
      options: { useUnifiedTopology: true },
      collection: 'log',
      level: 'error'
    })
  ]
});
