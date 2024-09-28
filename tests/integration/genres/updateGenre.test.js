const request = require('supertest');
const mongoose = require('mongoose');

const { Genre } = require('../../../models/genre');
const { User } = require('../../../models/user');

let server;
beforeAll(async () => {
  server = await require('../../../index');
});
afterAll(async () => {
  await server.close();
  await Genre.deleteMany({});
});

describe('PUT /:id', () => {
  let token;
  let newName;
  let genre;
  let id;

  const exec = () => {
    return request(server)
      .put('/api/genres/' + id)
      .set('x-auth-token', token)
      .send({ name: newName });
  };

  beforeEach(async () => {
    genre = new Genre({ name: 'genre1' });
    await genre.save();

    id = genre._id;
    token = new User().generateAuthToken();
    newName = 'updatedGenre';
  });

  it('should return 401 if client is not logged in', async () => {
    token = '';

    const res = await exec();

    expect(res.status).toBe(401);
  });

  it('should return 400 if genre name is less than 3 characters', async () => {
    newName = 'ab';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if genre name is more than 100 characters', async () => {
    newName = new Array(102).join('a');

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 404 if id is invalid', async () => {
    id = '1';

    const res = await exec();

    expect(res.status).toBe(404);
  });

  it('should return 404 if no genre with the given id exists', async () => {
    id = new mongoose.Types.ObjectId();

    const res = await exec();

    expect(res.status).toBe(404);
  });

  it('should update the genre if input is valid', async () => {
    await exec();

    const updatedGenre = await Genre.findById(genre._id);

    expect(updatedGenre).toBeTruthy();
    expect(updatedGenre.name).toBe(newName);
  });

  it('should return the updated genre if input is valid', async () => {
    const res = await exec();

    expect(res.body).toHaveProperty('_id', genre._id.toHexString());
    expect(res.body).toHaveProperty('name', newName);
  });
});
