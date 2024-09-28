const request = require('supertest');
const mongoose = require('mongoose');

const { User } = require('../../../models/user');
const { Customer } = require('../../../models/customer');

beforeAll(async () => {
  server = await require('../../../index');
});
afterAll(async () => {
  await server.close();
  await Customer.deleteMany({});
});

describe('PUT /:id', () => {
  let token;
  let newName;
  let newPhone;
  let customer;
  let id;

  const exec = () => {
    return request(server)
      .put('/api/customers/' + id)
      .set('x-auth-token', token)
      .send({ name: newName, phone: newPhone });
  };

  beforeEach(async () => {
    customer = new Customer({ name: 'customer1', phone: '+1234567890' });
    await customer.save();

    id = customer._id;
    token = new User().generateAuthToken();
    newName = 'updatedCustomer';
    newPhone = '+0987654321';
  });

  it('should return 401 if client is not logged in', async () => {
    token = '';

    const res = await exec();

    expect(res.status).toBe(401);
  });

  it('should return 400 if customer name is less than 3 characters', async () => {
    newName = 'ab';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if customer name is more than 100 characters', async () => {
    newName = new Array(102).join('a');

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if customer phone is less than 10 characters', async () => {
    newPhone = '+123456789';

    const res = await exec();

    expect(res.status).toBe(400);
  });

  it('should return 400 if customer phone is more than 15 characters', async () => {
    newPhone = '+123456789123456';

    const res = await exec();

    expect(res.status).toBe(400);
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

  it('should update the customer if input is valid', async () => {
    await exec();

    const updatedCustomer = await Customer.findById(customer._id);

    expect(updatedCustomer).toBeTruthy();
    expect(updatedCustomer.name).toBe(newName);
    expect(updatedCustomer.phone).toBe(newPhone);
  });

  it('should return the updated customer if input is valid', async () => {
    const res = await exec();

    expect(res.body).toHaveProperty('_id', customer._id.toHexString());
    expect(res.body).toHaveProperty('name', newName);
    expect(res.body).toHaveProperty('phone', newPhone);
  });
});
