const { Customer, validate } = require('../models/customer');
const express = require('express');
const router = express.Router();
const _ = require('lodash');
const validateObjectId = require('../middlewares/validateObjectId');
const auth = require('../middlewares/auth');
const admin = require('../middlewares/admin');
const validateBody = require('../middlewares/validate');

router.get('/', async (req, res) => {
  const customer = await Customer.find().sort({ name: 1 });
  res.send(customer);
});

router.get('/:id', validateObjectId, async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer)
    res.status(404).send('The customer with the given ID was not found.');

  res.send(customer);
});

router.post('/', [auth, validateBody(validate)], async (req, res) => {
  const customer = new Customer(_.pick(req.body, ['name', 'phone', 'isGold']));

  await customer.validate();
  await customer.save();

  res.send(customer);
});

router.put(
  '/:id',
  [auth, validateObjectId, validateBody(validate)],
  async (req, res) => {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      _.pick(req.body, ['name', 'isGold', 'phone']),
      { new: true }
    );
    if (!customer)
      return res
        .status(404)
        .send('The customer with the given ID was not found.');

    res.send(customer);
  }
);

router.delete('/:id', auth, admin, validateObjectId, async (req, res) => {
  const customer = await Customer.findByIdAndDelete(req.params.id);
  if (!customer)
    return res
      .status(404)
      .send('The customer with the given ID was not found.');

  res.send(customer);
});

module.exports = router;
