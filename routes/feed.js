import express from 'express';

import {
  createPost,
  getPosts
} from '../controllers/feed.js';

const router = express.Router();

// GET /feed/posts
router.get('/posts', getPosts);

// POST /feed/posts
router.post('/posts', createPost);

export default router;
