import redis from 'redis';
import jwt from 'jsonwebtoken';

const redisClient = redis.createClient();

function cacheToken(req, res, next) {
  const { token } = req.params; // caching data specific to a user

  jwt
    .verify(token, process.env.JWT_SECRET)
    .then((response) => {
      const cacheKey = `account:${response.accountNumber}`;

      redisClient.hGetAll(cacheKey, (err, cachedData) => {
        if (err) {
          console.error('Redis cache error:', err);
          next(); // Proceed to database if cache error occurs
        }

        if (cachedData !== null) {
          // Data found in cache, return the cached response
          const data = JSON.parse(cachedData);
          res.json(data);
        } else {
          // Data not found in cache, proceed to the database
          next();
        }
      });
    })
    .catch((err) => {});
}

export default cacheToken;
