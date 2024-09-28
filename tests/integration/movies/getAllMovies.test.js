const request = require('supertest');
const mongoose = require('mongoose');

const { Movie } = require('../../../models/movie');

beforeAll(async () => {
  server = await require('../../../index');
});
afterAll(async () => {
  await server.close();
  await Movie.deleteMany({});
});

describe('GET /', () => {
  it('should return all movies', async () => {
    await Movie.collection.insertMany([
      {
        title: 'movie1',
        genre: {
          _id: new mongoose.Types.ObjectId(),
          name: 'genre1'
        },
        numberInStock: 1,
        dailyRentalRate: 1
      },
      {
        title: 'movie2',
        genre: {
          _id: new mongoose.Types.ObjectId(),
          name: 'genre2'
        },
        numberInStock: 1,
        dailyRentalRate: 1
      }
    ]);

    const res = await request(server).get('/api/movies');

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body.some(g => g.title === 'movie1')).toBeTruthy();
    expect(res.body.some(g => g.title === 'movie2')).toBeTruthy();
  });
});
