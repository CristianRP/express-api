import { validationResult } from 'express-validator'

const getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [{
      _id: 123,
      title: 'First Post',
      content: 'This is the first post!',
      imageUrl: 'images/duck.jpg',
      creator: {
        name: 'Cristian',
      },
      date: new Date()
    }]
  });
};

const createPost = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422)  
      .json({
        message: 'Validation failed',
        errors: errors.array()
      })
  }

  const { title, content } = req.body;
  // create post in db
  res.status(201).json({
    message: 'Post created',
    post: {
      _id: new Date().toISOString(),
      title,
      content,
      creator: { name: 'Cristian' },
      createdAt: new Date()
    }
  });
};

export {
  getPosts,
  createPost
}
