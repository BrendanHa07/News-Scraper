// dependencies
var express = require('express');
var app = express.Router();
var path = require('path');
var request = require('request');
var cheerio = require('cheerio');
var Comments = require('../models/Comment.js');
var Article = require('../models/Articles.js');
var axios = require('axios');

// index route 
app.get('/', function(req, res) {
    res.render('index');
});

// scrape route
app.get('/scrape', function(req, res) {
    request('http://www.espn.com/', function(err, response, html) {
        var $ = cheerio.load(html);

        $('section.contentItem__content').each(function(i, element) {
            
            var title = $(this)
                .children('a')
                .text()
                .trim();
            var link = $(this)
                .children('a')
                .attr("href");

            var result = {};
            
            result.title = title;
            result.link = link;

            Article
                .create(result)
                .then(function(dbArticle) {
                    res.send("Scrape complete!")
                })
                .catch(function(err) {
                    res.json(err);
                });
        });
    });
    res.redirect('/articles');
});

// Route for getting all articles
app.get('/articles', function(req, res) {
    Article
        .find({}, function(err, doc) {
            if (err) {
                console.log(err)
            } else {
                res.render('index', {result: doc});
            }
        })
        // will sort artilces by most recent (descending order)
        .sort({'_id': -1})
});

// Route for grabbing specific article with comment (ObjectId)
app.get('/articles/:id', function(req, res) {
    Article
    .findOne({_id: req.params.id})
    .populate("comment")
    .then(function(dbArticle) {
        res.render("comment", {result: dbArticle});
    })
    .catch(function(err) {
        res.json(err);
    });
});

// route to create comment
app.post('/comments/:id', function(req, res) {

    var articleId = req.params.id;
    Comments
        .create(req.body)
        .then(function(dbComment) {
            return Article.findOneAndUpdate({_id: req.params.id}, { $push: {comment: dbComment._id}}, {new: true})
        })
        .exec(function(err, doc) {
            if (err) {
                console.log(err)
            } else {
                res.redirect('/articles/' + articleId);
            }
        });
});

// route for saving/updated an article's comment
app.post('/articles/:id', function(req, res) {
    Comments
        .create(req.body)
        .then(function(dbComments) {
            return db.Article.findOneAndUpdate({_id: req.params.id}, {comment: dbComments._id}, {new: true});
        })
        .then(function(dbArticle) {
            res.json(dbArticle);
        })
        .catch(function(err) {
            res.json(err);
        });
});

module.exports = app;