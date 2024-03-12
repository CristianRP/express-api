

const getPosts = (req, res, next) => {
  res.status(200).json({
    posts: [{
      title: 'First Post',
      content: 'This is the first post!'
    }]
  });
};

const createPost = (req, res, next) => {
  const { title, content } = req.body;
  // create post in db
  res.status(201).json({
    message: 'Post created',
    post: {
      id: new Date().toISOString(),
      title,
      content
    }
  });
};

export {
  getPosts,
  createPost
}
