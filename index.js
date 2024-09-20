const Joi = require('joi');
const express = require('express');
const app = express();
app.use(express.json());

const genres = [
  { id: 1, name: 'genre1' },
  { id: 2, name: 'genre2' },
  { id: 3, name: 'genre3' },
];

function validateCourse(genre) {
  const schema = Joi.object({ name: Joi.string().min(3).max(50).required() });
  return schema.validate(genre);
}

app.get('/api/genres', (req, res) => {
  res.send(genres);
});

app.get('/api/genres/:id', (req, res) => {
  const genre = genres.find((id) => id === parseInt(req.params.id));
  if (!genre)
    return res.status(404).send(`Invalid genre with ID = ${req.params.id}!`);
  res.send(genre);
});

app.post('/api/genres', (req, res) => {
  const newGenre = {
    id: genres.length + 1,
    name: req.body.name,
  };

  const { error } = validateCourse(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  genres.push(newGenre);

  res.send(newGenre);
});

app.put('/api/genres/:id', (req, res) => {
  const genre = genres.find((g) => g.id === parseInt(req.params.id));
  if (!genre)
    return res.status(404).send(`Invalid genre with ID = ${req.params.id}!`);

  const { error } = validateCourse(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const newGenre = { id: genre.id, name: req.body.name };
  genres[genre.id - 1] = newGenre;

  res.send(newGenre);
});

app.delete('/api/genres/:id', (req, res) => {
  const genre = genres.find((g) => g.id === parseInt(req.params.id));
  if (!genre)
    return res.status(404).send(`Invalid genre with ID = ${req.params.id}!`);

  genres.pop(genre);

  res.send(genre);
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Listening to port ${port}`);
});
