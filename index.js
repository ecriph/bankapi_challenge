import mongoose from 'mongoose';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import user from './v1/router/user.js';
import Limiter from './v1/middleware/rate-limit.js';
import redis from 'redis';

dotenv.config();

mongoose.connect(process.env.DEV_DATABASE_URL);
mongoose.Promise = global.Promise;
const redisClient = redis.createClient();

const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(Limiter);
app.use('/api/v1', user);
app.use((err, req, res, next) => {
  if (res.headerSent) {
    next(err);
  }
  res
    .status(err.code || 422)
    .json({ message: err.message || 'Unknown error occured' });
});

redisClient.on('error', function (err) {
  console.log('Redis error: ' + err.message);
});
app.listen(process.env.PORT || 3002, function () {
  console.log('Sever running');
});
