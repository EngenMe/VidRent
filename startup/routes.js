const express = require('express');

const customers = require('../routes/customers');
const error = require('../middlewares/error');
const genres = require('../routes/genres');
const movies = require('../routes/movies');
const rentals = require('../routes/rentals');
const users = require('../routes/users');
const returns = require('../routes/returns');

module.exports = function (app) {
  app.use(express.json());

  app.use('/api/genres', genres);
  app.use('/api/customers', customers);
  app.use('/api/movies', movies);
  app.use('/api/rentals', rentals);
  app.use('/api/users', users);
  app.use('/api/returns', returns);

  app.use(error);
};
