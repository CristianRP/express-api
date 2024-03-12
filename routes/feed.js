import express from 'express';
import { body } from 'express-validator';

import {
  createPost,
  deletePost,
  getPost,
  getPosts,
  updatePost
} from '../controllers/feed.js';
import isAuth from '../middleware/is-auth.js';

const router = express.Router();

// GET /feed/posts
router.get('/posts', isAuth, getPosts);

// POST /feed/posts
router.post(
  '/posts',
  [
    body('title')
      .trim()
      .isLength({ min: 5 }),
    body('content')
      .trim()
      .isLength({ min: 5 })
  ],
  isAuth,
  createPost
);

router.get('/posts/:postId', isAuth, getPost);

router.put(
  '/posts/:postId',
  [
    body('title')
      .trim()
      .isLength({ min: 5 }),
    body('content')
      .trim()
      .isLength({ min: 5 })
  ],
  isAuth,
  updatePost
);

router.delete('/posts/:postId', isAuth, deletePost);

export default router;
