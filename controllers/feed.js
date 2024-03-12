import fs from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

import { validationResult } from 'express-validator'

import Post from '../models/post.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

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

const updatePost = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const error = new Error('Validation failed');
    error.statusCode = 422;
    throw error;
  }

  const { postId } = req.params;
  const { title, content } = req.body;
  let imageUrl = req.body.image;
  if (req.file) {
    imageUrl = req.file.path;
  }
  if (!imageUrl) {
    const error = new Error('No file picked.');
    error.statusCode = 422;
    throw error;
  }

  Post.findOne({ _id: postId })
    .then(post => {
      if (!post) {
        const error = new Error('Cound not find post.');
        error.statusCode = 404;
        throw error;
      }

      if (imageUrl !== post.imageUrl) {
        clearImage(post.imageUrl);
      }

      return Post.findByIdAndUpdate(post._id, { title, content, imageUrl }, { new: true });
    })
    .then(updatedPost => {
      console.log(updatedPost);
      res.status(200).json({
        message: 'Post updated',
        post: updatedPost
      });
    })
    .catch(error => {
      console.log(error);
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
}

const clearImage = filePath => {
  filePath = join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err));
}

export {
  getPosts,
  createPost,
  getPost,
  updatePost
}
