// dependencies
var express = require('express');
var app = express.Router();
var request = require('request');
var cheerio = require('cheerio');
var Comments = require('../models/Comment.js');
var Article = require('../models/Articles.js');

// index route 
app.get('/', function(req, res) {
    Article
        .find({})
        .then(function(dbArticle) {
            res.render('index', {result: dbArticle});
        })
        .catch(function(err) {
            res.json(err);
        });
});

// scrape route
app.get('/scrape', function(req, res) {
    request('http://www.espn.com', function(error, response, html) {
        var $ = cheerio.load(html);

        $('section.contentItem__content').each(function(i, element) {

            var title = $(element).children().text();
            var link = $(element).children('a').attr('href');
    
            var result = {};

            result.title = title;
            result.link = link;

            Article
                .create(result)
                .then(function(dbArticle){
                    // res.send(dbArticle);
                    // console.log("Result: " + dbArticle)
                    console.log("Scrape complete!")
                })
                .catch(function(err) {
                    res.json(err)
                    // console.log(err)
                });
        });
        res.redirect('/articles');
    });
});

// Route for getting all articles
app.get('/articles', function(req, res) {
    Article
        .find({})
        .then(function(dbArticles) {
            res.render('index', {result: dbArticles});
        })
        .catch(function(err) {
            res.json(err);
        });
});

// Route for grabbing specific article with comment (ObjectId)
app.get('/articles/:id', function(req, res) {
    Article
    .findOne({_id: req.params.id})
    .populate("comment")
    .then(function(dbArticle) {
        res.render("comments", {result: dbArticle});
    })
    .catch(function(err) {
        res.json(err);
    });
});

 // Create a new comment
 app.post("/articles/:id", function (req, res) {
    // Create a new Comment and pass the req.body to the entry
    Comments
      .create(req.body, function (error, doc) {
        // Log any errors
        if (error) {
          console.log(error// Otherwise
          );
        } else {
          // Use the article id to find and update it's comment
          Article.findOneAndUpdate({
            "_id": req.params.id
          }, {
            $push: {
              "comment": doc._id
            }
          }, {
            safe: true,
            upsert: true,
            new: true
          })
          // Execute the above query
            .exec(function (err, doc) {
              // Log any errors
              if (err) {
                console.log(err);
              } else {
                // Or send the document to the browser
                res.redirect('back');
              }
            });
        }
      });
  });

// route to delete comment
app.delete("/articles/:id/:commentid", function (req, res) {
    Comments
      .findByIdAndRemove(req.params.commentid, function (error, doc) {
        // Log any errors
        if (error) {
          console.log(error// Otherwise
          );
        } else {
          console.log(doc);
          Article.findOneAndUpdate({
            "_id": req.params.id
          }, {
            $pull: {
              "Comments": doc._id
            }
          })
          // Execute the above query
            .exec(function (err, doc) {
              // Log any errors
              if (err) {
                console.log(err);
              }
            });
        }
      });
  });


module.exports = app;