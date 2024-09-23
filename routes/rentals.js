const { Rental, validate } = require('../models/rental');
const express = require('express');
const router = express.Router();
const { Customer } = require('../models/customer');
const { Movie } = require('../models/movie');

router.get('/', async (req, res) => {
  const rental = await Rental.find().sort({ dateOut: -1 });
  res.send(rental);
});

router.get('/:id', async (req, res) => {
  const rental = await Rental.findById(req.params.id);

  if (!rental)
    return res.status(404).send('The rental with the given ID was not found.');

  res.send(rental);
});

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const customer = await Customer.findById(req.body.customerId);
  if (!customer) return res.status(400).send('Invalid customer.');

  const movie = await Movie.findById(req.body.movieId);
  if (!movie) return res.status(400).send('Invalid movie.');

  let rental = new Rental({
    customer: {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone,
      isGold: customer.isGold,
    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate,
    },
  });

  try {
    rental = await rental.save();
    movie.numberInStock--;

    try {
      await movie.save();
    } catch (err) {
      res.status(500).send('Something went wrong while saving the movie.');
    }

    res.send(rental);
  } catch (err) {
    res.status(500).send('Something went wrong while saving the rental.');
  }
});

module.exports = router;
