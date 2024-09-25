require('express-async-errors');
const error = require('./middlewares/error');
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const genres = require('./routes/genres');
const customers = require('./routes/customers');
const movies = require('./routes/movies');
const rentals = require('./routes/rentals');
const Fawn = require('fawn');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);
const users = require('./routes/users');
const auth = require('./routes/auth');
const config = require('config');
const winston = require('winston');

process.on('uncaughtException', ex => {
  console.log('WE GOT AN UNCAUGHT EXCEPTION !');
  winston.error(ex.message, ex);
});

process.on('unhandledRejection', ex => {
  console.log('WE GOT AN PROMISE REJECTION !');
  winston.error(ex.message, ex);
});

const p = Promise.reject(new Error('Soemthing failed!'));

if (!config.get('jwtPrivateKey')) {
  console.error('FATAL ERROR: jwtPrivateKey is not defined!');
  process.exit(1);
}

mongoose
  .connect('mongodb://localhost/vidly')
  .then(() => console.log('DB connected successfully...'))
  .catch(err => console.error('Failed to connect!'));

Fawn.init(mongoose);

app.use(express.json());

app.use('/api/genres', genres);
app.use('/api/customers', customers);
app.use('/api/movies', movies);
app.use('/api/rentals', rentals);
app.use('/api/users', users);
app.use('/api/auth', auth);

app.use(error);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
