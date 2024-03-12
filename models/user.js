import { Schema, Types, model } from 'mongoose';

const userSchema = new Schema({
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'I\'m new'
  },
  posts: [
    {
      type: Types.ObjectId,
      ref: 'Post'
    }
  ]
});

export default model('User', userSchema);
