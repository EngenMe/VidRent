const mongoose = require('mongoose');
const request = require('supertest');
const moment = require('moment');

const { Rental } = require('../../models/rental');
const { User } = require('../../models/user');
const { Movie } = require('../../models/movie');

let server;
let customerId;
let movieId;
let rental;
let token;
let movie;

describe('/api/returns', () => {
  beforeEach(async () => {
    server = require('../../index');

    customerId = new mongoose.Types.ObjectId();
    movieId = new mongoose.Types.ObjectId();

    movie = new Movie({
      _id: movieId,
      title: '12345',
      genre: { _id: new mongoose.Types.ObjectId(), name: '12345' },
      numberInStock: 1,
      dailyRentalRate: 1
    });
    await movie.save();

    rental = new Rental({
      customer: { _id: customerId, name: '123', phone: '+1234567890' },
      movie: {
        _id: movieId,
        title: '12345',
        numberInStock: 1,
        dailyRentalRate: 1
      }
    });

    await rental.save();

    token = new User().generateAuthToken();
  });

  afterEach(async () => {
    await server.close();
    await Rental.deleteMany({});
    await Movie.deleteMany({});
  });

  const exec = () => {
    return request(server)
      .post('/api/returns')
      .set('x-auth-token', token)
      .send({ customerId, movieId });
  };

  it('should return 401 if client is not logged in', async () => {
    token = '';

    const res = await exec();

    expect(res.status).toBe(401);
  });

  it('should return 400 if customer id is not provided', async () => {
    customerId = '';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if movie id is not provided', async () => {
    movieId = '';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 404 if no rental is found at given customer id', async () => {
    await Rental.deleteOne({});

    const res = await exec();

    expect(res.status).toBe(404);
  });

  it('should return 400 if return is already processed', async () => {
    rental.dateReturned = new Date();
    await rental.save();

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 200 if return a valid request', async () => {
    const res = await exec();

    expect(res.status).toBe(200);
  });

  it('should set the return date if input is valid', async () => {
    await exec();

    rentalInDb = await Rental.findById(rental._id);

    const diff = new Date() - rentalInDb.dateReturned;
    expect(diff).toBeLessThan(10 * 1000);
  });

  it('should calculate the rental fee', async () => {
    rental.dateOut = moment().add(-7, 'days').toDate();

    await exec();

    const rentalInDb = await Rental.findById(rental._id);

    const totalFee =
      (rentalInDb.dateReturned - rentalInDb.dateOut) *
      rentalInDb.movie.dailyRentalRate;
    expect(rentalInDb.rentalFee).toBe(totalFee);
  });

  it('stock should be increased', async () => {
    await exec();

    const movieInDb = await Movie.findById(movie._id);

    expect(movieInDb.numberInStock).toBe(movie.numberInStock + 1);
  });

  it('should return the rental if input is valid', async () => {
    const res = await exec();

    const rentalInDb = await Rental.findById(rental._id);

    const rentalObject = rentalInDb.toObject();

    rentalObject._id = rentalObject._id.toString();
    rentalObject.customer._id = rentalObject.customer._id.toString();
    rentalObject.movie._id = rentalObject.movie._id.toString();

    rentalObject.dateOut = rentalObject.dateOut.toISOString();
    rentalObject.dateReturned = rentalObject.dateReturned.toISOString();

    expect(res.body).toMatchObject(rentalObject);
  });
});
