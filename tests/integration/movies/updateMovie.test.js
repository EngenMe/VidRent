const request = require('supertest');
const mongoose = require('mongoose');

const { User } = require('../../../models/user');
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

describe('PUT /:id', () => {
  let token;
  let newTitle;
  let newGenre;
  let newNumberInStock;
  let newDailyRentalRate;
  let movie;
  let genre;
  let id;

  const exec = () => {
    return request(server)
      .put('/api/movies/' + id)
      .set('x-auth-token', token)
      .send({
        title: newTitle,
        genreId: newGenre._id,
        numberInStock: newNumberInStock,
        dailyRentalRate: newDailyRentalRate
      });
  };

  beforeEach(async () => {
    genre = new Genre({ name: 'genre1' });
    await genre.save();
    movie = new Movie({
      title: 'movie1',
      genre,
      numberInStock: 1,
      dailyRentalRate: 1
    });
    await movie.save();

    id = movie._id;
    token = new User().generateAuthToken();

    newTitle = 'updatedMovie';
    newGenre = await Genre.findByIdAndUpdate(
      genre._id,
      { name: 'updatedGenre' },
      { new: true }
    );
    newNumberInStock = 2;
    newDailyRentalRate = 2;
  });

  it('should return 401 if client is not logged in', async () => {
    token = '';

    const res = await exec();

    expect(res.status).toBe(401);
  });

  it('should return 400 if movie title is less than 5 characters', async () => {
    newTitle = '1234';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if movie title is more than 255 characters', async () => {
    newTitle = new Array(257).join('a');

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if number in stock is less than 0', async () => {
    newNumberInStock = -1;

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if number in stock is more than 255', async () => {
    newNumberInStock = 256;

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if daily rental rate is less than 0', async () => {
    newDailyRentalRate = -1;

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if daily rental rate is more than 255', async () => {
    newDailyRentalRate = 256;

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 404 if id is invalid', async () => {
    id = '1';

    const res = await exec();

    expect(res.status).toBe(404);
  });

  it('should return 404 if no movie with the given id exists', async () => {
    id = new mongoose.Types.ObjectId();

    const res = await exec();

    expect(res.status).toBe(404);
  });

  it('should update the movie if input is valid', async () => {
    await exec();

    const updatedMovie = await Movie.findById(movie._id);

    expect(updatedMovie.title).toBe(newTitle);
    expect(updatedMovie.genre._id).toEqual(newGenre._id);
    expect(updatedMovie.genre.name).toBe(newGenre.name);
    expect(updatedMovie.numberInStock).toEqual(newNumberInStock);
    expect(updatedMovie.dailyRentalRate).toEqual(newDailyRentalRate);
  });

  it('should return the updated movie if input is valid', async () => {
    const res = await exec();

    expect(res.body).toHaveProperty('_id', movie._id.toHexString());
    expect(res.body).toHaveProperty('title', newTitle);
    expect(res.body.genre).toHaveProperty('_id', newGenre._id.toHexString());
    expect(res.body.genre).toHaveProperty('name', newGenre.name);
    expect(res.body).toHaveProperty('numberInStock', newNumberInStock);
    expect(res.body).toHaveProperty('dailyRentalRate', newDailyRentalRate);
  });
});
