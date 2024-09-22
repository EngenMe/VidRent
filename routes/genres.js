const mongoose = require('mongoose');
const Joi = require('joi');
const express = require('express');
const router = express.Router();

const Genre = mongoose.model(
  'Genre',
  new mongoose.Schema({
    name: {
      type: String,
      require: true,
      min: 3,
      max: 100,
      trim: true,
      unique: true,
    },
  })
);

function validateGenre(genre) {
  const schema = Joi.object({ name: Joi.string().min(3).max(100).required() });
  return schema.validate(genre);
}

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
  const { error } = validateGenre(req.body);
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
  const { error } = validateGenre(req.body);
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
    const genre = await Genre.findByIdAndDelete(req.params.id);
    res.send(genre);
  } catch (err) {
    res.status(404).send(err.message);
  }
});

module.exports = router;
