const { User, validate } = require('../models/user');
const express = require('express');
const router = express.Router();
const _ = require('lodash');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config');

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (await User.findOne({ email: req.body.email }))
    return res
      .status(400)
      .send(`User with email ${req.body.email} is already exist!`);

  const user = new User(_.pick(req.body, ['name', 'email', 'password']));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);

  try {
    await user.save();
    const token = user.generateAuthToken();
    res
      .header('x-auth-token', token)
      .send(_.pick(user, ['_id', 'name', 'email']));
  } catch (err) {
    res.status(400).send(err.message);
  }
});

module.exports = router;
