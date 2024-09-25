const winston = require('winston');
require('winston-mongodb');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp'] })
  ),
  transports: [
    new winston.transports.File({ filename: 'logfile.log', level: 'info' }),
    new winston.transports.File({ filename: 'error.log', level: 'error' }),

    new winston.transports.MongoDB({
      db: 'mongodb://localhost/vidly',
      options: { useUnifiedTopology: true },
      collection: 'log',
      level: 'info'
    }),

    new winston.transports.MongoDB({
      db: 'mongodb://localhost/vidly',
      options: { useUnifiedTopology: true },
      collection: 'log',
      level: 'error'
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.prettyPrint(),
        winston.format.simple()
      ),
      level: 'info'
    })
  );
}

module.exports = logger;
