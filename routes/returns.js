const express = require('express');
const Joi = require('joi');

const auth = require('../middlewares/auth');
const { Rental } = require('../models/rental');
const { Movie } = require('../models/movie');
const validate = require('../middlewares/validate');

const router = express.Router();

router.post('/', [auth, validate(validateReturn)], async (req, res) => {
  const rental = await Rental.findOne({
    'customer._id': req.body.customerId,
    'movie._id': req.body.movieId
  });
  if (!rental) return res.status(404).send('No rental found');

  if (rental.dateReturned) res.status(400).send('Return is already processed');

  rental.return();

  await rental.save();

  await Movie.updateOne(
    { _id: rental.movie._id },
    { $inc: { numberInStock: 1 } }
  );

  return res.send(rental);
});

function validateReturn(req) {
  const schema = Joi.object({
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required()
  });

  return schema.validate(req);
}

module.exports = router;
