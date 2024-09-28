const request = require('supertest');
const mongoose = require('mongoose');

const { Genre } = require('../../../models/genre');

beforeAll(async () => {
  server = await require('../../../index');
});
afterAll(async () => {
  await server.close();
  await Genre.deleteMany({});
});

describe('GET /:id', () => {
  it('should return a genre if valid id is passed', async () => {
    const genre = new Genre({ name: 'genre1' });
    await genre.save();

    const res = await request(server).get(`/api/genres/${genre._id}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', genre.name);
  });

  it('should return 404 if invalid id is passed', async () => {
    const res = await request(server).get('/api/genres/1');

    expect(res.status).toBe(404);
  });

  it('should return 404 if no genre with the given id exist', async () => {
    const id = new mongoose.Types.ObjectId();
    const res = await request(server).get('/api/genres/' + id);

    expect(res.status).toBe(404);
  });
});
