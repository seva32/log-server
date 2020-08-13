// const dotenv = require("dotenv");
const _ = require("lodash"),
  fs = require("fs"),
  path = require("path"),
  express = require("express"),
  bodyParser = require("body-parser"),
  serveIndex = require("serve-index"),
  serveStatic = require("serve-static"),
  Log = require("./Log"),
  cors = require("./cors"),
  helmet = require("helmet"),
  rateLimiterMiddleware = require("./rateLimiter");

// dotenv.config({ silent: true });

///
/// Process the arguments
///
var argv = require("yargs")
  .usage("Usage: $0 -p [num] -d [string]")
  .demandOption(["p", "d"]).argv;

/// normalize options
argv.d = path.resolve(argv.d);

///
/// Initalize filesystem
///
if (!fs.existsSync(argv.d)) {
  fs.mkdirSync(argv.d);
}

///
/// Initialize express
///

var app = express();

// parse text/plain
app.use(bodyParser.raw({ type: "text/plain", limit: 1024 * 1024 * 10 }));

// parse json
app.use(bodyParser.json({ type: "*/*", limit: "100kb" }));
app.use(
  bodyParser.urlencoded({
    limit: "100kb",
    extended: true,
    parameterLimit: 1000,
  })
);

app.use(helmet());
app.use(cors);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Credentials", false);
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,PUT,POST,DELETE,UPDATE,OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "X-Access-Token, X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Authorization, refreshToken, seva, CSRF-Token"
  );

  next();
});

app.use(rateLimiterMiddleware);

///
/// POST '/:id/log' - Log the request body into a file. Each request will appended
/// into a file.
///
app.post("/:id/log/", function (req, res) {
  var logName = req.params.id;
  Log(argv.d, logName)
    .write(req.body)
    .then(function () {
      res.send();
    });
});

///
/// Get '/log' - Log the request body into a file. Each request will appended
/// into a file.
///
app.get("/*", serveIndex(argv.d, { icons: true, view: "details" }));
app.get("/*.log", serveStatic(argv.d, { icons: true }));

app.use("*", (req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("No es necesario un path para el directorio... \n");
});

/// Start server
app.listen(argv.p);

///
/// Show somethin on stdout
///
console.log(_.template("http://localhost:<%= port %>")({ port: argv.p }));

console.log(_.template("Logs directory '<%= dir %>'")({ dir: argv.d }));
