const mongoose = require('mongoose');
const Joi = require('joi');
const passwordComplexity = require('joi-password-complexity');
const jwt = require('jsonwebtoken');
const config = require('config');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 50,
    trim: true
  },
  email: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 255,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minlength: 8,
    maxlength: 1024
  }
});

userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id }, config.get('jwtPrivateKey'));
};

const User = mongoose.model('User', userSchema);

const complexityOptions = {
  min: 8,
  max: 1024,
  lowerCase: 1,
  upperCase: 1,
  numeric: 1,
  symbol: 1,
  requirementCount: 4
};

function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).trim().required().messages({
      'string.base': `"name" should be a type of 'text'`,
      'string.empty': `"name" cannot be an empty field`,
      'string.min': `"name" should have a minimum length of {#limit}`,
      'string.max': `"name" should have a maximum length of {#limit}`,
      'any.required': `"name" is a required field`
    }),
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .min(5)
      .max(255)
      .trim()
      .required()
      .messages({
        'string.base': `"email" should be a type of 'text'`,
        'string.empty': `"email" cannot be an empty field`,
        'string.email': `"email" must be a valid email`,
        'string.min': `"email" should have a minimum length of {#limit}`,
        'string.max': `"email" should have a maximum length of {#limit}`,
        'any.required': `"email" is a required field`
      }),
    password: passwordComplexity(complexityOptions).required().messages({
      'string.base': `"password" should be a type of 'text'`,
      'string.empty': `"password" cannot be an empty field`,
      'passwordComplexity.tooShort': `"password" should have a minimum length of {#limit}`,
      'passwordComplexity.tooLong': `"password" should have a maximum length of {#limit}`,
      'passwordComplexity.lowercase': `"password" should contain at least {#min} lowercase letter`,
      'passwordComplexity.uppercase': `"password" should contain at least {#min} uppercase letter`,
      'passwordComplexity.numeric': `"password" should contain at least {#min} number`,
      'passwordComplexity.symbol': `"password" should contain at least {#min} special character`
    })
  });

  return schema.validate(user, { abortEarly: false });
}

exports.User = User;
exports.validate = validateUser;
