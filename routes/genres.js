const { Genre, validate } = require('../models/genre');
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const genres = await Genre.find().sort({ name: 1 });
  res.send(genres);
});

router.get('/:id', async (req, res) => {
  try {
    const genre = await Genre.findById(req.params.id);
    res.send(genre);
  } catch (err) {
    res.status(404).send(err.message);
  }
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let newGenre = new Genre({
    name: req.body.name,
  });

  try {
    await newGenre.validate();
    const result = await newGenre.save();
    res.send(result);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.put('/:id', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const updatedGenre = await Genre.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );
    res.send(updatedGenre);
  } catch (err) {
    res.status(404).send(err.message);
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedGenre = await Genre.findByIdAndDelete(req.params.id);

    if (!deletedGenre)
      return res.status(404).send(`Genre with ID=${req.params.id} not found!`);

    res.send(deletedGenre);
  } catch (err) {
    res.status(404).send(err.message);
  }
});

module.exports = router;
