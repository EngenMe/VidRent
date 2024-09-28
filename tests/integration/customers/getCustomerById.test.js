const request = require('supertest');
const mongoose = require('mongoose');

const { Customer } = require('../../../models/customer');

beforeAll(async () => {
  server = await require('../../../index');
});
afterAll(async () => {
  await server.close();
  await Customer.deleteMany({});
});

describe('GET /:id', () => {
  it('should return a customer if valid id is passed', async () => {
    const customer = new Customer({
      name: 'customer1',
      phone: '+1234567890'
    });
    await customer.save();

    const res = await request(server).get(`/api/customers/${customer._id}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('name', customer.name);
  });

  it('should return 404 if invalid id is passed', async () => {
    const res = await request(server).get('/api/customers/1');

    expect(res.status).toBe(404);
  });

  it('should return 404 if no customer with the given id exist', async () => {
    const id = new mongoose.Types.ObjectId();
    const res = await request(server).get('/api/customers/' + id);

    expect(res.status).toBe(404);
  });
});
