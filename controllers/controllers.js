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
        .sort({_id: -1})
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
                    console.log("Article Added to the db!")
                })
                .catch(function(err) {
                    // res.json(err)
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
app.get('/articles/:id/', function(req, res) {
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


// Create new comment
app.post("/comments/:id", function(req, res) {
  // Create a new note and pass the req.body to the entry
  var articleId = req.params.id;
  Comments
    .create(req.body)
    .then(function(dbComment) {
      // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
      // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
      // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
      return Article.findOneAndUpdate({ _id: req.params.id }, {$push: { comment: dbComment._id }}, { new: true })
      .populate('comment');
    })
    .then(function(dbArticle) {
      // If we were able to successfully update an Article, send it back to the client
    //   res.json(dbArticle);
      console.log("Comment added to the db")
    //   console.log(JSON.stringify(dbArticle));
    })
    .catch(function(err) {
        res.json(err);
        console.log("Error with posting!")
    }); 
    res.redirect('/articles/' + articleId);
});

// route to delete comment
app.delete("/comment/delete/:comment_id", function (req, res) {
    Comments
        .findOneAndRemove({_id: req.params.comment_id})
        .then(function(dbcomment) {
            res.json(dbComment);
            console.log("Successfully deleted!")
        })
        .catch(function(err) {
            res.json(err);
            console.log("Error with deletion!")
        });
    
  });


module.exports = app;