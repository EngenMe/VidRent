const mongoose = require('mongoose');
const Joi = require('joi');
const express = require('express');
const router = express.Router();

const Customer = mongoose.model(
  'Customer',
  new mongoose.Schema({
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 100,
      trim: true,
      unique: true,
    },
    phone: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 15,
      match: [
        /^\+?[0-9]{10,15}$/,
        'Phone number is invalid. It must contain only digits and may start with a +.',
      ],
    },
    isGold: {
      type: Boolean,
      default: false,
    },
  })
);

function validateCustomer(customer) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(100).required(),
    phone: Joi.string()
      .min(10)
      .max(15)
      .pattern(/^\+?[0-9]{10,15}$/)
      .required()
      .messages({
        'string.pattern.base':
          'Phone number is invalid. It must contain only digits and may start with a +.',
      }),
    isGold: Joi.boolean(),
  });

  return schema.validate(customer);
}

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
  const { error } = validateCustomer(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let newCustomer = new Customer(req.body);

  try {
    await newCustomer.validate();
    const result = await newCustomer.save();
    res.send(result);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

router.put('/:id', async (req, res) => {
  const { error } = validateCustomer(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  try {
    const updatedCustomer = await Customer.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );
    res.send(updatedCustomer);
  } catch (err) {
    res.status(404).send(err.message);
  }
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
