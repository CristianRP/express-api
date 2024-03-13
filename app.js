import fs from 'fs';
import { fileURLToPath } from 'url';
import { join, dirname } from 'path';

import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import multer from 'multer';
import { createHandler } from 'graphql-http/lib/use/express';

import graphqlSchema from './graphql/schema.js';
import rootValue from './graphql/resolvers.js';
import auth from './middleware/auth.js';

// import { init } from './socket.js';

const MONGODB_URI = 'mongodb+srv://cristianramirezgt:291fWV8RTsNeQPtc@clusternodejs.u8wma2f.mongodb.net/messages?retryWrites=true&w=majority&appName=ClusterNodeJS';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(null, false);
  }
}

const app = express();

app.use(bodyParser.json()); // application/json
app.use(multer({
    storage: fileStorage,
    fileFilter
  }).single('image')
);
app.use('/images', express.static(join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, POST, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

app.use(auth);

app.put('/images', (req, res, next) => {
  if (!req.isAuth) {
    const error = new Error('User not authenticated');
    error.code = 401;
    throw error;
  }

  if (!req.file) {
    return res.status(200).json({
      message: 'No file provided!'
    })
  }
  if (req.body.oldPath) {
    clearImage(req.body.oldPath);
  }
  return res.status(201).json({
    message: 'File stored.',
    filePath: req.file.path
  });
});

app.use('/graphql', (req, res) => {
  createHandler({
    schema: graphqlSchema,
    rootValue,
    formatError(err) {
      if (!err.originalError) {
        return err;
      }
      const { data, code } = err.originalError;
      const message = err.message || 'An error ocurred';
      return { message, status: code, data };
    },
    context: { req, res }
  })(req, res);
})

app.use((error, req, res, next) => {
  console.log(error);
  const { statusCode, message, data } = error;
  res.status(statusCode)
    .json({
      message,
      data
    });
});

mongoose.connect(
  MONGODB_URI
)
.then(() => {
  app.listen(8080);
  // init(server);j
  // const io = getIO();
  
  // io.on('connection', (socket) => {
  //   console.log('Client connected');
  // });
})
.catch(console.error);

const clearImage = filePath => {
  filePath = join(__dirname, '..', filePath);
  fs.unlink(filePath, err => console.log(err));
}
