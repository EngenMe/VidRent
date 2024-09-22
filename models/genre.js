const mongoose = require('mongoose');
const Joi = require('joi');

const Genre = mongoose.model(
  'Genre',
  new mongoose.Schema({
    name: {
      type: String,
      required: true,
      minlength: 3,
      maxlength: 100,
      trim: true,
      unique: true,
    },
  })
);

function validateGenre(genre) {
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
  });

  return schema.validate(genre);
}

exports.Genre = Genre;
exports.validate = validateGenre;
