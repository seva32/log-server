const dotenv = require("dotenv");

const { RateLimiterMongo } = require("rate-limiter-flexible");
const mongoose = require("mongoose");

dotenv.config({ silent: true });

mongoose.connect(process.env.MONGOOSE, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const mongoConn = mongoose.connection;

const opts = {
  storeClient: mongoConn,
  points: process.env.REQUEST_PER_SECOND_LIMIT || 15, // 'n' requests
  duration: 1, // Per second(s)
};

const rateLimiterMongo = new RateLimiterMongo(opts);

const rateLimiterMiddleware = (req, res, next) => {
  rateLimiterMongo
    .consume(req.ip, 2) // consume 2 points
    .then((rateLimiterRes) => {
      next(); // 2 points consumed
    })
    .catch((rateLimiterRes) => {
      res.status(429).send("Too Many Requests");
      // Not enough points to consume
    });
};

module.exports = rateLimiterMiddleware;
