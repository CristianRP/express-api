import User from '../models/user.js';

const getUserStatus = async (req, res, next) => {
  const user = await User.findById(req.params.userId);

  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    status: user.status
  })
}

const updateUserState = async (req, res, next) => {
  const { userId } = req.params;
  const { status } = req.body;
  const user = await User.findOneAndUpdate({ _id: userId }, { status }, { new: true });

  res.status(200).json({
    user
  })
}

export {
  getUserStatus,
  updateUserState
}
