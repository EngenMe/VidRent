const request = require('supertest');
const mongoose = require('mongoose');

const { Customer } = require('../../../models/customer');
const { Genre } = require('../../../models/genre');
const { Movie } = require('../../../models/movie');
const { Rental } = require('../../../models/rental');
const { User } = require('../../../models/user');

let server;
beforeAll(async () => {
  server = await require('../../../index');
});
afterAll(async () => {
  await server.close();
  await Rental.deleteMany({});
  await Movie.deleteMany({});
  await Genre.deleteMany({});
  await Customer.deleteMany({});
});

describe('POST /', () => {
  let token;
  let customer;
  let genre;
  let movie;
  let customerId;
  let movieId;

  const exec = async () => {
    return request(server)
      .post('/api/rentals')
      .set('x-auth-token', token)
      .send({ customerId: customerId, movieId: movieId });
  };

  beforeEach(async () => {
    token = new User().generateAuthToken();

    customer = new Customer({
      name: 'customer2',
      phone: '+0987654321'
    });
    await customer.save();

    genre = new Genre({ name: 'genre2' });
    await genre.save();

    movie = new Movie({
      title: 'movie2',
      genre: { _id: genre._id, name: genre.name },
      numberInStock: 2,
      dailyRentalRate: 2
    });
    await movie.save();

    customerId = customer._id;
    movieId = movie._id;
  });

  it('should return 401 if client is not logged in', async () => {
    token = '';

    const res = await exec();

    expect(res.status).toBe(401);
  });

  it('should return 400 if invalid body', async () => {
    customerId = '1';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 404 if no customer found', async () => {
    customerId = new mongoose.Types.ObjectId();

    const res = await exec();

    expect(res.status).toBe(404);
  });

  it('should return 404 if no movie found', async () => {
    movieId = new mongoose.Types.ObjectId();

    const res = await exec();

    expect(res.status).toBe(404);
  });

  it('should return 400 if not available in stock', async () => {
    movie.numberInStock = 0;
    await movie.save();

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return the rental if it is valid', async () => {
    const res = await exec();

    expect(res.status).toBe(200);

    expect(res.body.customer._id.toString()).toBe(customer._id.toString());
    expect(res.body.customer.name).toBe(customer.name);
    expect(res.body.customer.phone).toBe(customer.phone);
    expect(res.body.movie._id.toString()).toBe(movie._id.toString());
    expect(res.body.movie.title).toBe(movie.title);
    expect(res.body.movie.dailyRentalRate).toEqual(movie.dailyRentalRate);
  });
});
