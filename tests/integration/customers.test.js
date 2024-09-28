const request = require('supertest');
const mongoose = require('mongoose');

const { Customer } = require('../../models/customer');
const { User } = require('../../models/user');

let server;
describe('/api/customers', () => {
  beforeAll(async () => {
    server = await require('../../index');
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

  describe('GET /:id', () => {
    it('should return a customer if valid id is passed', async () => {
      const customer = new Customer({
        name: 'customer1',
        phone: '+1234567891'
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

  describe('POST /', () => {
    let token;
    let name;
    let phone;
    const exec = () => {
      return request(server)
        .post('/api/customers')
        .set('x-auth-token', token)
        .send({
          name,
          phone
        });
    };

    beforeEach(() => {
      token = new User().generateAuthToken();
      name = 'customer1';
      phone = '+1234567891';
    });

    it('should return 401 if client is not logged in', async () => {
      token = '';
      const res = await exec();

      expect(res.status).toBe(401);
    });

    it('should return 400 if customer name is less than 3 characters', async () => {
      name = '12';
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if customer name is more than 100 characters', async () => {
      name = new Array(102).join('a');

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if customer phone is less than 10 characters', async () => {
      phone = '+123456789';
      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should return 400 if customer phone is more than 15 characters', async () => {
      phone = '+123456789123456';

      const res = await exec();

      expect(res.status).toBe(400);
    });

    it('should save customer if it is valid', async () => {
      await exec();

      const customer = await Customer.find({
        name: 'customer1'
      });

      expect(customer).not.toBeNull();
    });

    it('should return the customer if it is valid', async () => {
      const res = await exec();

      expect(res.body).toHaveProperty('_id');
      expect(res.body).toHaveProperty('name', 'customer1');
      expect(res.body).toHaveProperty('phone', '+1234567891');
    });
  });
});
