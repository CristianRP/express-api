import { validationResult } from 'express-validator'

import Post from '../models/post.js';

const getPosts = (req, res, next) => {
  Post.find()
    .then(posts => {
      res.status(200).json({
        message: 'Fetched posts successfully',
        posts
      });
    })
    .catch(error => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

const createPost = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    throw error;
  }

  if (!req.file) {
    const error = new Error('No image provided.');
    error.statusCode = 422;
    throw error;
  }

  const { title, content } = req.body;

  const post = new Post({
    title,
    content,
    imageUrl: req.file.path,
    creator: {
      name: 'Cristian'
    }
  });

  post.save()
    .then(result => {
      res.status(201).json({
        message: 'Post created',
        post: result
      });
    })
    .catch(error => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

const getPost = (req, res, next) => {
  const { postId } = req.params;
  console.log(postId);
  Post.findById(postId)
    .then(post => {
      if (!post) {
        const error = new Error('Cound not find post.');
        error.statusCode = 404;
        throw error;
      }

      res.status(200)
        .json({
          message: 'Post fetched',
          post
        });
    })
    .catch(error => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    })
}

export {
  getPosts,
  createPost,
  getPost
}
