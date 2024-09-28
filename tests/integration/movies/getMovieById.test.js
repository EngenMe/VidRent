const request = require('supertest');
const mongoose = require('mongoose');

const { Movie } = require('../../../models/movie');
const { Genre } = require('../../../models/genre');

let server;
beforeAll(async () => {
  server = await require('../../../index');
});
afterAll(async () => {
  await server.close();
  await Movie.deleteMany({});
  await Genre.deleteMany({});
});

describe('GET /:id', () => {
  it('should return a movie if valid id is passed', async () => {
    const genre = new Genre({ name: 'genre1' });
    await genre.save();

    const movie = new Movie({
      title: 'movie1',
      genre: { _id: genre._id, name: genre.name },
      numberInStock: 1,
      dailyRentalRate: 1
    });
    await movie.save();

    const res = await request(server).get(`/api/movies/${movie._id}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('title', movie.title);
    expect(res.body.genre).toMatchObject({
      _id: movie.genre._id.toHexString(),
      name: movie.genre.name
    });
    expect(res.body).toHaveProperty('numberInStock', movie.numberInStock);
    expect(res.body).toHaveProperty('dailyRentalRate', movie.dailyRentalRate);
  });

  it('should return 404 if invalid id is passed', async () => {
    const res = await request(server).get('/api/movies/1');

    expect(res.status).toBe(404);
  });

  it('should return 404 if no customer with the given id exist', async () => {
    const id = new mongoose.Types.ObjectId();
    const res = await request(server).get('/api/movies/' + id);

    expect(res.status).toBe(404);
  });
});
