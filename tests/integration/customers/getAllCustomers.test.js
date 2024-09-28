const request = require('supertest');

const { Customer } = require('../../../models/customer');

let server;
beforeAll(async () => {
  server = await require('../../../index');
});
afterAll(async () => {
  await server.close();
  await Customer.deleteMany({});
});

describe('GET /', () => {
  it('should return all customers', async () => {
    await Customer.collection.insertMany([
      { name: 'customer1' },
      { name: 'customer2' }
    ]);

    const res = await request(server).get('/api/customers');

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body.some(g => g.name === 'customer1')).toBeTruthy();
    expect(res.body.some(g => g.name === 'customer2')).toBeTruthy();
  });
});
