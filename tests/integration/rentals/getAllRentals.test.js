const request = require('supertest');
const _ = require('lodash');
const mongoose = require('mongoose');

const { Rental } = require('../../../models/rental');

let server;
beforeAll(async () => {
  server = await require('../../../index');
});
afterAll(async () => {
  await server.close();
  await Rental.deleteMany({});
});

describe('GET /', () => {
  let customer1;
  let customer2;
  let genre1;
  let genre2;
  let movie1;
  let movie2;
  beforeEach(async () => {
    customer1 = {
      _id: new mongoose.Types.ObjectId(),
      name: 'customer1',
      phone: '+1234567890'
    };
    customer2 = {
      _id: new mongoose.Types.ObjectId(),
      name: 'customer2',
      phone: '+0987654321'
    };

    genre1 = {
      _id: new mongoose.Types.ObjectId(),
      name: 'genre1'
    };
    genre2 = {
      _id: new mongoose.Types.ObjectId(),
      name: 'genre2'
    };

    movie1 = {
      _id: new mongoose.Types.ObjectId(),
      title: 'movie1',
      genre: genre1,
      numberInStock: 1,
      dailyRentalRate: 1
    };
    movie2 = {
      _id: new mongoose.Types.ObjectId(),
      title: 'movie2',
      genre: genre2,
      numberInStock: 2,
      dailyRentalRate: 2
    };
  });

  it('should return all rentals', async () => {
    const dateOut1 = Date.now();
    const dateOut2 = Date.now();
    await Rental.collection.insertMany([
      { customer: customer1, movie: movie1, dateOut: dateOut1, rentalFee: 1 },
      { customer: customer2, movie: movie2, dateOut: dateOut2, rentalFee: 2 }
    ]);

    const res = await request(server).get('/api/rentals');

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);

    expect(
      res.body.some(
        g =>
          g.customer._id.toString() === customer1._id.toString() &&
          g.customer.name === customer1.name &&
          g.customer.phone === customer1.phone &&
          g.movie._id.toString() === movie1._id.toString() &&
          g.movie.title === movie1.title &&
          g.movie.genre._id.toString() === movie1.genre._id.toString() &&
          g.movie.genre.name === movie1.genre.name &&
          g.movie.numberInStock === movie1.numberInStock &&
          g.movie.dailyRentalRate === movie1.dailyRentalRate &&
          new Date(g.dateOut).toISOString() ===
            new Date(dateOut1).toISOString() &&
          g.rentalFee === 1
      )
    ).toBeTruthy();

    expect(
      res.body.some(
        g =>
          g.customer._id.toString() === customer2._id.toString() &&
          g.customer.name === customer2.name &&
          g.customer.phone === customer2.phone &&
          g.movie._id.toString() === movie2._id.toString() &&
          g.movie.title === movie2.title &&
          g.movie.genre._id.toString() === movie2.genre._id.toString() &&
          g.movie.genre.name === movie2.genre.name &&
          g.movie.numberInStock === movie2.numberInStock &&
          g.movie.dailyRentalRate === movie2.dailyRentalRate &&
          new Date(g.dateOut).toISOString() ===
            new Date(dateOut2).toISOString() &&
          g.rentalFee === 2
      )
    ).toBeTruthy();
  });
});
