const mongoose = require('mongoose');
const Joi = require('joi');

const rentalSchema = new mongoose.Schema({
  customer: {
    type: new mongoose.Schema({
      name: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 100,
        trim: true,
        unique: true
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
    }),
    required: true
  },
  movie: {
    type: new mongoose.Schema({
      title: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        trim: true
      },
      dailyRentalRate: {
        type: Number,
        min: 0,
        max: 255,
        required: true
      },
      numberInStock: {
        type: Number,
        min: 0,
        max: 255,
        required: true
      }
    }),
    required: true
  },
  dateOut: {
    type: Date,
    required: true,
    default: Date.now
  },
  dateReturned: {
    type: Date
  },
  rentalFee: {
    type: Number,
    min: 0,
    max: 100_000
  }
});

rentalSchema.methods.return = function () {
  this.dateReturned = new Date();
  this.rentalFee =
    (this.dateReturned - this.dateOut) * this.movie.dailyRentalRate;
};

const Rental = mongoose.model('Rental', rentalSchema);

function validateRental(rental) {
  const schema = Joi.object({
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required(),
    rentalFee: Joi.number().min(0).max(100000)
  });

  return schema.validate(rental);
}

exports.Rental = Rental;
exports.validate = validateRental;
