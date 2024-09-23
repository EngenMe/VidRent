const { Genre } = require('../models/genre');
const { Movie, validate } = require('../models/movie');
const express = require('express');
const router = express.Router();
const _ = require('lodash');

router.get('/', async (req, res) => {
  const movies = await Movie.find().sort({ title: 1 });
  res.send(movies);
});

router.get('/:id', async (req, res) => {
  const movie = await Movie.findById(req.params.id);

  if (!movie)
    return res.status(404).send('The movie with the given ID was not found.');

  res.send(movie);
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(400).send('Invalid genre.');

  const movie = new Movie({
    ..._.pick(req.body, ['title', 'numberInStock', 'dailyRentalRate']),
    genre: {
      _id: genre._id,
      name: genre.name
    }
  });

  try {
    await movie.save();
    res.send(movie);
  } catch (err) {
    res.status(500).send('Something went wrong while saving the movie.');
  }
});

router.put('/:id', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(400).send('Invalid genre.');

  const movie = await Movie.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      genre: { _id: genre._id, name: genre.name },
      numberInStock: req.body.numberInStock,
      dailyRentalRate: req.body.dailyRentalRate
    },
    { new: true }
  );

  if (!movie)
    return res.status(404).send('Movie with the given ID was not found.');

  res.send(movie);
});

router.delete('/:id', async (req, res) => {
  try {
    const movie = await Movie.findByIdAndDelete(req.params.id);
    console.log(movie);

    if (!movie)
      return res.status(404).send(`Movie with ID=${req.params.id} not found!`);

    res.send(movie);
  } catch (err) {
    res.status(404).send(err.message);
  }
});

module.exports = router;
