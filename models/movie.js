const mongoose = require('mongoose');
const Joi = require('joi');

const Movie = mongoose.model(
  'Movie',
  new mongoose.Schema({
    title: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 255,
      trim: true
    },
    genre: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Genre',
        required: true
      },
      name: {
        type: String,
        required: true
      }
    },
    numberInStock: {
      type: Number,
      min: 0,
      max: 255,
      required: true
    },
    dailyRentalRate: {
      type: Number,
      min: 0,
      max: 255,
      required: true
    }
  })
);

function validateMovie(movie) {
  const schema = Joi.object({
    title: Joi.string().min(5).max(255).required(),
    genreId: Joi.objectId().required(),
    numberInStock: Joi.number().min(0).max(255).required(),
    dailyRentalRate: Joi.number().min(0).max(255).required()
  });

  return schema.validate(movie);
}

exports.Movie = Movie;
exports.validate = validateMovie;
