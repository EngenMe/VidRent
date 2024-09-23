const { Customer, validate } = require('../models/customer');
const express = require('express');
const router = express.Router();
const _ = require('lodash');

router.get('/', async (req, res) => {
  const customer = await Customer.find().sort({ name: 1 });
  res.send(customer);
});

router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    res.send(customer);
  } catch (err) {
    res.status(404).send(err.message);
  }
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const newCustomer = new Customer(
    _.pick(req.body, ['name', 'phone', 'isGold'])
  );

  try {
    await newCustomer.validate();
    await newCustomer.save();
    res.send(newCustomer);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.put('/:id', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      isGold: req.body.isGold,
      phone: req.body.phone
    },
    { new: true }
  );

  if (!customer)
    return res
      .status(404)
      .send('The customer with the given ID was not found.');

  res.send(customer);
});

router.delete('/:id', async (req, res) => {
  try {
    const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);

    if (!deletedCustomer)
      return res
        .status(404)
        .send(`Customer with ID=${req.params.id} not found!`);

    res.send(deletedCustomer);
  } catch (err) {
    res.status(404).send(err.message);
  }
});

module.exports = router;
