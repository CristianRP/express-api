import bcrypt from 'bcryptjs';

import User from '../models/user.js';

const rootValue = {
  createUser: async (args, req) => {
    const { email, name, password } = args.userInput;
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
  }
}

export default rootValue;
