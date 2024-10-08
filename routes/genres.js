const { Genre, validate } = require('../models/genre');
const express = require('express');
const router = express.Router();
const _ = require('lodash');
const validateObjectId = require('../middlewares/validateObjectId');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const validateBody = require('../middlewares/validate');

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

router.post('/', [auth, validateBody(validate)], async (req, res) => {
  const genre = new Genre(_.pick(req.body, ['name']));

  await genre.validate();
  await genre.save();

  res.send(genre);
});

router.put(
  '/:id',
  [auth, validateObjectId, validateBody(validate)],
  async (req, res) => {
    const genre = await Genre.findByIdAndUpdate(
      req.params.id,
      _.pick(req.body, ['name']),
      { new: true }
    );
    if (!genre)
      res.status(404).send('The genre with the given ID was not found.');

    res.send(genre);
  }
);

router.delete('/:id', auth, admin, validateObjectId, async (req, res) => {
  const genre = await Genre.findByIdAndDelete(req.params.id);
  if (!genre)
    res.status(404).send('The genre with the given ID was not found.');

  res.send(genre);
});

module.exports = router;
