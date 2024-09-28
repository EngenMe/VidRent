const mongoose = require('mongoose');
const Joi = require('joi');

const Customer = mongoose.model(
  'Customer',
  new mongoose.Schema({
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 100,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      minlength: 10,
      maxlength: 15,
      match: [
        /^\+?[0-9]{10,15}$/,
        'Phone number is invalid. It must contain only digits and may start with a +.'
      ]
    },
    isGold: {
      type: Boolean,
      default: false
    }
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
          'Phone number is invalid. It must contain only digits and may start with a +.'
      }),
    isGold: Joi.boolean()
  });

  return schema.validate(customer);
}

exports.Customer = Customer;
exports.validate = validateCustomer;
