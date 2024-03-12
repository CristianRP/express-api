import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import User from '../models/user.js';

const signup = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    error.data = errors.array();
    throw error;
  }
  const { email, password, name } = req.body;

  bcrypt.hash(password, 12)
    .then(hashedPassword => {
      const user = User({
        email,
        password: hashedPassword,
        name
      });
      return user.save();
    })
    .then(user => {
      res.status(201).json({
        message: 'User created!',
        userId: user._id
      })
    })
    .catch(error => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
}

export {
  signup
}
