import express from 'express';
import { body } from 'express-validator';

import {
  createPost,
  getPost,
  getPosts
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
      .isLength({ min: 7 }),
    body('content')
      .trim()
      .isLength({ min: 5 })
  ],
  createPost
);

router.get('/posts/:postId', getPost);

export default router;
