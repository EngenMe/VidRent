const express = require('express');
const router = express.Router();
const Fawn = require('fawn');
const _ = require('lodash');
const validateObjectId = require('../middlewares/validateObjectId');
const auth = require('../middlewares/auth');

const { Rental, validate } = require('../models/rental');
const { Customer } = require('../models/customer');
const { Movie } = require('../models/movie');

router.get('/', async (req, res) => {
  const rentals = await Rental.find().sort({ dateOut: -1 });
  res.send(rentals);
});

router.get('/:id', validateObjectId, async (req, res) => {
  const rental = await Rental.findById(req.params.id);

  if (!rental)
    return res.status(404).send('The rental with the given ID was not found.');

  res.send(rental);
});

router.post('/', auth, async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(404).send('Invalid customer.');

  const movie = await Movie.findById(req.body.movieId);
  if (!movie) return res.status(404).send('Invalid movie.');
  if (movie.numberInStock === 0)
    return res.status(400).send('Movie not in stock.');

  let rental = new Rental({
    customer: _.pick(customer, ['_id', 'name', 'phone', 'isGold']),
    movie: _.pick(movie, ['_id', 'title', 'dailyRentalRate'])
  });

  new Fawn.Task()
    .save('rentals', rental)
    .update(
      'movies',
      { _id: movie._id },
      {
        $inc: { numberInStock: -1 }
      }
    )
    .run();

  res.send(rental);
});

module.exports = router;
