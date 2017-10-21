// Dependencies
var express = require("express");
var exphbs = require("express-handlebars");
var cheerio = require("cheerio");
var request = require("request");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var Comment = require('./models/Comment.js');
var Article = require('./models/Articles.js');

// Initialize Express
var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Require models

var PORT = process.env.PORT || 3030;

// Set up a static folder (public) for our web app
app.use(express.static("public"));


// Express-Handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Database configuration with mongoose
mongoose.Promise = Promise;
mongoose.connect("mongodb://localhost/news-scraper", {
  useMongoClient: true
});

var db = mongoose.connection;

// show mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error)
});

// log success message once in db
db.once("open", function() {
  console.log("Mongoose connection successful!");
});

// import routes
var routes = require('./controllers/controllers.js');
app.use('/', routes);


// Launch App
app.listen(PORT, function(){
  console.log('Running on port: ' + PORT);
});
