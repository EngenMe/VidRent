const winston = require('winston');
require('winston-mongodb');

const logger = winston.createLogger({
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

// Check if we're in development mode, and add a console transport for debugging
if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple()
    })
  );
}

module.exports = logger;
