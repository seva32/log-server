"use strict";

const cors = require("cors");

const corsOptions = {
  origin: "*",
  methods: "GET,HEAD,POST,PATCH,DELETE,OPTIONS",
  credentials: false,
  exposedHeaders: ["refreshToken", "X-Access-Token", "seva", "CSRF-Token"],
};

module.exports = cors(corsOptions);
