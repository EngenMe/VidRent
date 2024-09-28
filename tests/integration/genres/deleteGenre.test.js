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

describe('DELETE /:id', () => {
  let token;
  let genre;
  let id;
  let user;
  let name = 'genre1';

  const exec = () => {
    return request(server)
      .delete('/api/genres/' + id)
      .set('x-auth-token', token)
      .send();
  };

  beforeEach(async () => {
    genre = new Genre({ name });
    await genre.save();

    id = genre._id;
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

  it('should return 404 if no genre with the given id exists', async () => {
    id = new mongoose.Types.ObjectId();

    const res = await exec();

    expect(res.status).toBe(404);
  });

  it('should delete the genre if input is valid', async () => {
    const res = await exec();

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('_id', genre._id.toHexString());
    expect(res.body).toHaveProperty('name', genre.name);

    const genreInDb = await Genre.findById(id);
    expect(genreInDb).toBeNull();
  });

  it('should return the deleted genre', async () => {
    const res = await exec();

    expect(res.body).toHaveProperty('_id', genre._id.toHexString());
    expect(res.body).toHaveProperty('name', genre.name);
  });

  it('should not delete any genre if unauthenticated', async () => {
    token = '';

    const res = await exec();

    expect(res.status).toBe(401);

    const genreInDb = await Genre.findById(id);
    expect(genreInDb.name).toBe(name);
  });

  it('should return 403 if the user does not have delete permissions', async () => {
    user.isAdmin = false;
    token = new User(user).generateAuthToken();

    const res = await exec();

    expect(res.status).toBe(403);
  });
});
