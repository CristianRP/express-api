import { Router } from 'express';
import { body } from 'express-validator';

import User from '../models/user.js';
import { login, signup } from '../controllers/auth.js';

const router = Router();

router.put(
  '/signup',
  [
    body('email')
      .isEmail()
      .withMessage('Please enter a valid email')
      .custom(async (value, { req }) => {
        const userDoc = await User.findOne({ email: value });
        if (userDoc) {
          return Promise.reject('Email address already exists!');
        }
        return true;
      })
      .normalizeEmail(),
    body('password').trim().isLength({ min: 5 }),
    body('name').trim().not().isEmpty()
  ],
  signup
);

router.post('/login', login)

export default router;
