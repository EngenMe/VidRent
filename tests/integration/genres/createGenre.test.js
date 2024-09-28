const request = require('supertest');

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

describe('POST /', () => {
  let token;
  let name;
  const exec = () => {
    return request(server).post('/api/genres').set('x-auth-token', token).send({
      name
    });
  };

  beforeEach(() => {
    token = new User().generateAuthToken();
    name = 'genre1';
  });

  it('should return 401 if client is not logged in', async () => {
    token = '';
    const res = await exec();

    expect(res.status).toBe(401);
  });

  it('should return 400 if genre name is less than 3 characters', async () => {
    name = '12';
    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if genre name is more than 100 characters', async () => {
    name = new Array(102).join('a');

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should save genre if it is valid', async () => {
    await exec();

    const genre = await Genre.findOne({ name });

    expect(genre.name).toBe(name);
  });

  it('should return the genre if it is valid', async () => {
    const res = await exec();

    expect(res.body).toHaveProperty('_id');
    expect(res.body).toHaveProperty('name', 'genre1');
  });
});
