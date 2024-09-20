const Joi = require('joi');
const express = require('express');
const router = express.Router();

let genres = [
  { id: 1, name: 'genre1' },
  { id: 2, name: 'genre2' },
  { id: 3, name: 'genre3' },
];

function validateCourse(genre) {
  const schema = Joi.object({ name: Joi.string().min(3).max(50).required() });
  return schema.validate(genre);
}

router.get('/', (req, res) => {
  res.send(genres);
});

router.get('/:id', (req, res) => {
  const genre = genres.find((id) => id === parseInt(req.params.id));
  if (!genre)
    return res.status(404).send(`Invalid genre with ID = ${req.params.id}!`);
  res.send(genre);
});

router.post('/', (req, res) => {
  const newGenre = {
    id: genres.length + 1,
    name: req.body.name,
  };

  const { error } = validateCourse(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  genres.push(newGenre);

  res.send(newGenre);
});

router.put('/:id', (req, res) => {
  const genre = genres.find((g) => g.id === parseInt(req.params.id));
  if (!genre)
    return res.status(404).send(`Invalid genre with ID = ${req.params.id}!`);

  const { error } = validateCourse(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const newGenre = { id: genre.id, name: req.body.name };
  genres[genre.id - 1] = newGenre;

  res.send(newGenre);
});

router.delete('/:id', (req, res) => {
  const genre = genres.find((g) => g.id === parseInt(req.params.id));
  if (!genre)
    return res.status(404).send(`Invalid genre with ID = ${req.params.id}!`);

  genres = genres.filter((g) => g.id !== genre.id);

  res.send(genre);
});

module.exports = router;
