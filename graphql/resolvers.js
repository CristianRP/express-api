import bcrypt from 'bcryptjs';
import validator from 'validator';
import jwt from 'jsonwebtoken';

import User from '../models/user.js';
import Post from '../models/post.js';
import { clearImage } from '../util/file.js';

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
      'secret',
      { expiresIn: '1h'}
    );
    return {
      token,
      userId: user._id.toString()
    }
  },
  createPost: async ({ postInput }, { req }) => {
    console.log(req.isAuth);
    if (!req.isAuth) {
      const error = new Error('Not authenticated!');
      error.code = 401;
      throw error;
    }

    const { title, content, imageUrl } = postInput;
    const errors = [];
    if (validator.isEmpty(title) || !validator.isLength(title, { min: 5 })) {
      errors.push({ message: 'Title is invalid' });
    }
    if (validator.isEmpty(content) || !validator.isLength(content, { min: 5 })) {
      errors.push({ message: 'Content is invalid' });
    }

    if (errors.length > 0) {
      const error = new Error('Invalid input');
      error.data = errors;
      error.code = 422;
      throw error;
    }

    const user = await User.findById(req.userId);
    if (!user) {
      const error = new Error('Invalid user');
      error.code = 401;
      throw error;
    }
    const post = new Post({
      title,
      content,
      imageUrl,
      creator: user
    });
    const createdPost = await post.save();
    user.posts.push(createdPost);
    await user.save();
    return {
      ...createdPost._doc,
      _id: createdPost._id.toString(),
      createdAt: createdPost.createdAt.toISOString(),
      updatedAt: createdPost.updatedAt.toISOString()
    }
  },
  posts: async ( { page }, { req }) => {
    if (!req.isAuth) {
      const error = new Error('User not authenticated');
      error.code = 401;
      throw error;
    }

    if (!page) {
      page = 1;
    }

    const perPage = 2;
    const posts = await Post.find()
      .where({ creator: { _id: req.userId } })
      .sort({ createdAt: -1 })
      .skip((page - 1) * perPage)
      .limit(perPage)
      .populate('creator');

    const count = await Post.countDocuments().where({ creator: { _id: req.userId }});
    return {
      posts: posts.map(post => {
        return {
          ...post._doc,
          _id: post._id.toString(),
          createdAt: post.createdAt.toISOString(),
          updatedAt: post.updatedAt.toISOString(),
          creator: {
            _id: post.creator._id.toString(),
            name: post.creator.name
          } 
        }
      }),
      totalPosts: count
    }
  },
  post: async ({ id }, { req }) => {
    if (!req.isAuth) {
      const error = new Error('User not Authenticated');
      error.code = 401;
      throw error;
    }

    if (!id) {
      const error = new Error('No id provided');
      error.code = 401;
      throw error;
    }

    const post = await Post.findById(id).populate('creator');
    if (!post) {
      const error = new Error('Post not found.');
      error.code = 403;
      throw error;
    }

    return {
      ...post._doc,
      _id: post._id.toString(),
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString()
    }
  },
  updatePost: async ({ id, postInput }, { req }) => {
    if (!req.isAuth) {
      const error = new Error('User not Authenticated');
      error.code = 401;
      throw error;
    }
    const post = await Post.findById(id).populate('creator');
    if (!post) {
      const error = new Error('No post found');
      error.code = 401;
      throw error;
    }
    if (post.creator._id.toString() !== req.userId.toString()) {
      const error = new Error('Not authorized');
      error.code = 401;
      throw error;
    }
    const { title, content, imageUrl } = postInput;
    const errors = [];
    if (validator.isEmpty(title) || !validator.isLength(title, { min: 5 })) {
      errors.push({ message: 'Title is invalid' });
    }
    if (validator.isEmpty(content) || !validator.isLength(content, { min: 5 })) {
      errors.push({ message: 'Content is invalid' });
    }

    if (errors.length > 0) {
      const error = new Error('Invalid input');
      error.data = errors;
      error.code = 422;
      throw error;
    }

    post.title = title;
    post.content = content;
    if (imageUrl !== 'undefined') {
      post.imageUrl = imageUrl;
    }

    const updatedPost = await post.save();
    return {
      ...updatedPost._doc,
      _id: updatedPost._id.toString(),
      createdAt: updatedPost.createdAt.toISOString(),
      updatedAt: updatedPost.updatedAt.toISOString()
    }
  },
  deletePost: async ({ id }, { req }) => {
    if (!req.isAuth) {
      const error = new Error('User not Authenticated');
      error.code = 401;
      throw error;
    }
    const post = await Post.findById(id);
    if (!post) {
      const error = new Error('No post found');
      error.code = 401;
      throw error;
    }
    if (post.creator.toString() !== req.userId.toString()) {
      const error = new Error('Not authorized');
      error.code = 401;
      throw error;
    }
    clearImage(post.imageUrl);
    await Post.findByIdAndDelete(id);
    const user = await User.findById(req.userId);
    user.posts.pull(id);
    await user.save();
    return true;
  },
  user: async (_, { req }) => {
    if (!req.isAuth) {
      const error = new Error('User not Authenticated');
      error.code = 401;
      throw error;
    }
    const user = await User.findById(req.userId);
    return {
      ...user._doc,
      _id: user._id.toString()
    }
  },
  updateStatus: async ({ status }, { req }) => {
    if (!req.isAuth) {
      const error = new Error('User not Authenticated');
      error.code = 401;
      throw error;
    }
    const user = await User.findById(req.userId);
    user.status = status,
    await user.save();
    return {
      ...user._doc,
      _id: user._id.toString() 
    }
  }
}

export default rootValue;
