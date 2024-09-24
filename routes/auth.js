const { User } = require('../models/user');
const express = require('express');
const router = express.Router();
const _ = require('lodash');
const bcrypt = require('bcrypt');
const Joi = require('joi');

function validate(req) {
  const schema = Joi.object({
    email: Joi.string()
      .email({ tlds: { allow: true } })
      .min(5)
      .max(255)
      .trim()
      .required(),
    password: Joi.string().required()
  });

  return schema.validate(req);
}

router.post('/', async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send('Invalid email or password!');

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send('Invalid email or password!');

  const newUser = new User(_.pick(req.body, ['name', 'email', 'password']));
  const salt = await bcrypt.genSalt(10);
  newUser.password = await bcrypt.hash(newUser.password, salt);

  const token = user.generateAuthToken();
  res.send(token);
});

module.exports = router;
