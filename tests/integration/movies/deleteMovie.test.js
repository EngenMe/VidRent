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

describe('DELETE /:id', () => {
  let token;
  let movie;
  let id;
  let user;
  let title = 'movie1';
  let genre = new Genre({ name: 'genre1' });
  let numberInStock = 1;
  let dailyRentalRate = 1;

  const exec = () => {
    return request(server)
      .delete('/api/movies/' + id)
      .set('x-auth-token', token)
      .send();
  };

  beforeEach(async () => {
    movie = new Movie({ title, genre, numberInStock, dailyRentalRate });
    await movie.save();

    id = movie._id;
    user = {
      name: 'user1',
      email: 'user@g.c',
      password: 'Us_12345',
      isAdmin: true
    };
    token = new User(user).generateAuthToken();
  });

  it('should return 401 if client is not logged in', async () => {
    token = '';

    const res = await exec();

    expect(res.status).toBe(401);
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

  it('should delete the movie if input is valid', async () => {
    const res = await exec();

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('_id', movie._id.toHexString());
    expect(res.body).toHaveProperty('title', title);
    expect(res.body.genre).toHaveProperty('_id', genre._id.toHexString());
    expect(res.body.genre).toHaveProperty('name', genre.name);
    expect(res.body).toHaveProperty('numberInStock', numberInStock);
    expect(res.body).toHaveProperty('dailyRentalRate', dailyRentalRate);

    const movieInDb = await Movie.findById(id);
    expect(movieInDb).toBeNull();
  });

  it('should return the deleted movie', async () => {
    const res = await exec();

    expect(res.body).toHaveProperty('_id', movie._id.toHexString());
    expect(res.body).toHaveProperty('title', title);
    expect(res.body.genre).toHaveProperty('_id', genre._id.toHexString());
    expect(res.body.genre).toHaveProperty('name', genre.name);
    expect(res.body).toHaveProperty('numberInStock', numberInStock);
    expect(res.body).toHaveProperty('dailyRentalRate', dailyRentalRate);
  });

  it('should not delete any movie if unauthenticated', async () => {
    token = '';

    const res = await exec();

    expect(res.status).toBe(401);

    const movieInDb = await Movie.findById(id);
    expect(movieInDb.title).toBe(title);
    expect(movieInDb.genre._id).toEqual(genre._id);
    expect(movieInDb.genre.name).toBe(genre.name);
    expect(movieInDb.numberInStock).toEqual(numberInStock);
    expect(movieInDb.dailyRentalRate).toEqual(dailyRentalRate);
  });

  it('should return 403 if the user does not have delete permissions', async () => {
    user.isAdmin = false;
    token = new User(user).generateAuthToken();

    const res = await exec();

    expect(res.status).toBe(403);
  });
});
