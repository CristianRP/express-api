import bcrypt from 'bcryptjs';
import validator from 'validator';
import jwt from 'jsonwebtoken';

import User from '../models/user.js';

const rootValue = {
  createUser: async (args, req) => {
    const { email, name, password } = args.userInput;

    const errors = [];
    if (!validator.isEmail(email)) {
      errors.push({ message: 'Email is invalid' });
    }

    if (validator.isEmpty(password) || !validator.isLength(password, { min: 5 })) {
      errors.push({ message: 'Password too short!' });
    }

    if (errors.length > 0) {
      const error = new Error('Invalid input');
      error.data = errors;
      error.code = 422;
      throw error;
    }

    const user = await User.findOne({ email });
    if (user) {
      const error = new Error('User exists already!');
      throw error;
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      email,
      name,
      password: hashedPassword
    });
    const createdUser = await newUser.save();
    return {
      ...createdUser._doc,
      _id: createdUser._id.toString()
    }
  },
  hello: () => {
    return {
      text: 'Hello'
    }
  },
  login: async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user) {
      const error = new Error('User not found');
      error.code = 401;
      throw error;
    }
    const isEqual = await bcrypt.compare(password, user.password);
    if (!isEqual) {
      const error = new Error('Password is not correct');
      error.code = 401;
      throw error;
    }
    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email
      },
      'secrect',
      { expiresIn: '1h'}
    );
    return {
      token,
      userId: user._id.toString()
    }
  }
}

export default rootValue;
