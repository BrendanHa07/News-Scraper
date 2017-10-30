// Dependencies
var express = require("express");
var exphbs = require("express-handlebars");
var cheerio = require("cheerio");
var request = require("request");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var Comments = require('./models/Comment.js');
var Article = require('./models/Articles.js');
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/mongo-scraper";
var PORT = process.env.PORT || 8000;

// Initialize Express
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Set up a static folder (public) for our web app
app.use(express.static("public"));


// Express-Handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Database configuration with mongoose
mongoose.Promise = Promise;

mongoose.connect(MONGODB_URI, {
  useMongoClient: true
});

process.on('unhandledRejection', up => { throw up })

// import routes
var routes = require('./controllers/controllers.js');
app.use('/', routes);


// Launch App
app.listen(PORT, function(){
  console.log('Running on port: ' + PORT);
});
