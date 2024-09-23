const { User, validate } = require('../models/user');
const express = require('express');
const router = express.Router();
const _ = require('lodash');

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (await User.findOne({ email: req.body.email }))
    return res
      .status(400)
      .send(`User with email ${req.body.email} is already exist!`);

  const newUser = new User(_.pick(req.body, ['name', 'email', 'password']));

  try {
    await newUser.save();
    res.send(_.pick(user, ['name', 'email']));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;
