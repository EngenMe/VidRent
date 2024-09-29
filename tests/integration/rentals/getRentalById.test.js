const request = require('supertest');
const mongoose = require('mongoose');

const { Customer } = require('../../../models/customer');
const { Genre } = require('../../../models/genre');
const { Movie } = require('../../../models/movie');
const { Rental } = require('../../../models/rental');

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

describe('GET /:id', () => {
  let customer;
  let genre;
  let movie;
  let dateOut;
  let rentalFee;
  let rental;

  beforeEach(async () => {
    customer = new Customer({
      name: 'customer1',
      phone: '+1234567890'
    });
    await customer.save();

    genre = new Genre({ name: 'genre1' });
    await genre.save();

    movie = new Movie({
      title: 'movie1',
      genre: { _id: genre._id, name: genre.name },
      numberInStock: 1,
      dailyRentalRate: 1
    });
    await movie.save();

    dateOut = Date.now();
    rentalFee = 1;
  });

  it('should return a rental if valid id is passed', async () => {
    rental = new Rental({
      customer: {
        _id: customer._id,
        name: customer.name,
        phone: customer.phone
      },
      movie: {
        _id: movie._id,
        title: movie.title,
        dailyRentalRate: movie.dailyRentalRate
      },
      dateOut,
      rentalFee
    });
    await rental.save();

    const res = await request(server).get(`/api/rentals/${rental._id}`);

    expect(res.status).toBe(200);

    expect(res.body.customer._id.toString()).toBe(customer._id.toString());
    expect(res.body.customer.name).toBe(customer.name);
    expect(res.body.customer.phone).toBe(customer.phone);
    expect(res.body.movie._id.toString()).toBe(movie._id.toString());
    expect(res.body.movie.title).toBe(movie.title);
    expect(res.body.movie.dailyRentalRate).toEqual(movie.dailyRentalRate);
    expect(new Date(res.body.dateOut).toISOString()).toBe(
      new Date(dateOut).toISOString()
    );
    expect(res.body.rentalFee).toEqual(rentalFee);
  });

  it('should return 404 if invalid id is passed', async () => {
    const res = await request(server).get('/api/rentals/1');

    expect(res.status).toBe(404);
  });

  it('should return 404 if no rental with the given id exist', async () => {
    const id = new mongoose.Types.ObjectId();
    const res = await request(server).get('/api/rentals/' + id);

    expect(res.status).toBe(404);
  });
});
