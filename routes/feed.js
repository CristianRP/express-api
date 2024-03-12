import express from 'express';
import { body } from 'express-validator';

import {
  createPost,
  getPost,
  getPosts,
  updatePost
} from '../controllers/feed.js';

const router = express.Router();

// GET /feed/posts
router.get('/posts', getPosts);

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
  createPost
);

router.get('/posts/:postId', getPost);

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
  updatePost
);

export default router;
