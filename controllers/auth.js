import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

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

const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error('A user with this email couldn\'t be found');
      error.statusCode = 401;
      throw error;
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error('Wrong password!');
      error.statusCode = 401;
      throw error;
    }

    const token = jwt.sign({
        email: user.email,
        userId: user._id.toString(),
      }, 
      'secret',
      { expiresIn: '1h' }
    );

    res.status(200).json({
      token,
      userId: user._id.toString()
    })
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    next(error);
  }
}

export {
  signup,
  login
}
