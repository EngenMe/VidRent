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

describe('POST /', () => {
  let token;
  let title;
  let genreId;
  let genre;
  let numberInStock;
  let dailyRentalRate;

  const exec = () => {
    return request(server).post('/api/movies').set('x-auth-token', token).send({
      title,
      genreId: genreId,
      numberInStock,
      dailyRentalRate
    });
  };

  beforeEach(async () => {
    token = new User().generateAuthToken();
    title = 'movie1';
    genre = new Genre({ name: 'genre1' });
    await genre.save();
    genreId = genre._id;
    numberInStock = 1;
    dailyRentalRate = 1;
  });

  it('should return 401 if client is not logged in', async () => {
    token = '';
    const res = await exec();

    expect(res.status).toBe(401);
  });

  it('should return 400 if movie title is less than 5 characters', async () => {
    title = '1234';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if movie title is more than 255 characters', async () => {
    title = new Array(257).join('a');

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if number in stock is less than 0', async () => {
    numberInStock = -1;

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if number in stock is more than 255', async () => {
    numberInStock = 256;

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if daily rental rate is less than 0', async () => {
    dailyRentalRate = -1;

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if daily rental rate is more than 255', async () => {
    dailyRentalRate = 256;

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if genre id is invalid', async () => {
    genreId = '1';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 404 if no genre with the given id exists', async () => {
    genreId = new mongoose.Types.ObjectId();

    const res = await exec();

    expect(res.status).toBe(404);
  });

  it('should save movie if it is valid', async () => {
    await exec();

    const movie = await Movie.findOne({ title });

    expect(movie.title).toBe(title);
    expect(movie.genre._id).toEqual(genre._id);
    expect(movie.genre.name).toBe(genre.name);
    expect(movie.numberInStock).toEqual(numberInStock);
    expect(movie.dailyRentalRate).toEqual(dailyRentalRate);
  });

  it('should return the movie if it is valid', async () => {
    const res = await exec();

    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('title', title);
    expect(res.body.genre).toHaveProperty('_id');
    expect(res.body.genre).toHaveProperty('name', genre.name);
    expect(res.body).toHaveProperty('numberInStock', numberInStock);
    expect(res.body).toHaveProperty('dailyRentalRate', dailyRentalRate);
  });
});
