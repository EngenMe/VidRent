const request = require('supertest');
const mongoose = require('mongoose');

const { User } = require('../../../models/user');
const { Customer } = require('../../../models/customer');

let server;
beforeAll(async () => {
  server = await require('../../../index');
});
afterAll(async () => {
  await server.close();
  await Customer.deleteMany({});
});

describe('DELETE /:id', () => {
  let token;
  let customer;
  let id;
  let user;
  let name = 'customer1';
  let phone = '+1234567890';

  const exec = () => {
    return request(server)
      .delete('/api/customers/' + id)
      .set('x-auth-token', token)
      .send();
  };

  beforeEach(async () => {
    customer = new Customer({
      name,
      phone
    });
    await customer.save();

    id = customer._id;
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

  it('should return 404 if no customer with the given id exists', async () => {
    id = new mongoose.Types.ObjectId();

    const res = await exec();

    expect(res.status).toBe(404);
  });

  it('should delete the customer if input is valid', async () => {
    const res = await exec();

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('_id', customer._id.toHexString());
    expect(res.body).toHaveProperty('name', customer.name);
    expect(res.body).toHaveProperty('phone', customer.phone);

    const customerInDb = await Customer.findById(id);
    expect(customerInDb).toBeNull();
  });

  it('should return the deleted customer', async () => {
    const res = await exec();

    expect(res.body).toHaveProperty('_id', customer._id.toHexString());
    expect(res.body).toHaveProperty('name', customer.name);
    expect(res.body).toHaveProperty('phone', customer.phone);
  });

  it('should not delete any customer if unauthenticated', async () => {
    token = '';

    const res = await exec();

    expect(res.status).toBe(401);

    const customerInDb = await Customer.findById(id);
    expect(customerInDb.name).toBe(name);
    expect(customerInDb.phone).toBe(phone);
  });

  it('should return 403 if the user does not have delete permissions', async () => {
    user.isAdmin = false;
    token = new User(user).generateAuthToken();

    const res = await exec();

    expect(res.status).toBe(403);
  });
});
