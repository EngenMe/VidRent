const { Genre, validate } = require('../models/genre');
const express = require('express');
const router = express.Router();
const _ = require('lodash');
const validateObjectId = require('../middlewares/validateObjectId');

router.get('/', async (req, res) => {
  const genres = await Genre.find().sort({ name: 1 });

  res.send(genres);
});

router.get('/:id', validateObjectId, async (req, res) => {
  const genre = await Genre.findById(req.params.id);
  if (!genre)
    res.status(404).send('The genre with the given ID was not found.');

  res.send(genre);
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = new Genre(_.pick(req.body, ['name']));

  await genre.validate();
  await genre.save();

  res.send(genre);
});

router.put('/:id', validateObjectId, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const genre = await Genre.findByIdAndUpdate(
    req.params.id,
    _.pick(req.body, ['name']),
    { new: true }
  );
  if (!genre)
    res.status(404).send('The genre with the given ID was not found.');

  res.send(genre);
});

router.delete('/:id', validateObjectId, async (req, res) => {
  const genre = await Genre.findByIdAndDelete(req.params.id);
  if (!genre)
    res.status(404).send('The genre with the given ID was not found.');

  res.send(genre);
});

module.exports = router;
