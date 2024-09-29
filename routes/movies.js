const { Genre } = require('../models/genre');
const { Movie, validate } = require('../models/movie');
const express = require('express');
const router = express.Router();
const _ = require('lodash');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const validateObjectId = require('../middlewares/validateObjectId');

router.get('/', async (req, res) => {
  const movies = await Movie.find().sort({ title: 1 });
  res.send(movies);
});

router.get('/:id', validateObjectId, async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie)
    return res.status(404).send('The movie with the given ID was not found.');

  res.send(movie);
});

router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(400).send('Invalid Genre.');

  const movie = new Movie({
    ..._.pick(req.body, ['title', 'numberInStock', 'dailyRentalRate']),
    genre: {
      _id: genre._id,
      name: genre.name
    }
  });

  await movie.validate();
  await movie.save();

  res.send(movie);
});

router.put('/:id', auth, validateObjectId, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(404).send('Invalid Genre.');

  const updateData = {
    ..._.pick(req.body, ['title', 'genre', 'numberInStock', 'dailyRentalRate']),
    genre: { _id: genre._id, name: genre.name }
  };
  const movie = await Movie.findByIdAndUpdate(req.params.id, updateData, {
    new: true
  });
  if (!movie)
    return res.status(404).send('Movie with the given ID was not found.');

  res.send(movie);
});

router.delete('/:id', auth, admin, validateObjectId, async (req, res) => {
  const movie = await Movie.findByIdAndDelete(req.params.id);
  if (!movie)
    return res.status(404).send('Movie with the given ID was not found.');

  res.send(movie);
});

module.exports = router;
