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
    request('http://www.espn.com/', function(err,response, html) {
        var $ = cheerio.load(html);

        $('section.contentItem__content').each(function(i, element) {
            
            var title = $(this)
                .children()
                .text()
            // console.log("Title: " + title);
            var summary = $(this)
                .children()
                .children('p')
                .text()
            // console.log("Summary: " + summary);
            var link = $(this)
                .children('a')
                .attr("href");

            var result = {};
            
            result.title = title;
            result.summary = summary;
            result.link = link;

            Article
                .create(result)
                .then(function(dbArticle) {
                    console.log("Result: " + result)
                    console.log("Scrape complete!")
                    res.json(dbArticle)
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
        .find({}, function(err, dbArticle) {
            if (err) {
                console.log(err)
            } else {
                res.render('index', {result: dbArticle});
            }
        })
        // will sort articles by most recent (descending order)
        .sort({'_id': -1})
});

// Route for grabbing specific article with comment (ObjectId)
app.get('/articles/:id', function(req, res) {
    Article
    .findOne({_id: req.params.id})
    .populate("Comments")
    .then(function(dbArticle) {
        res.render("comments", {result: dbArticle});
    })
    .catch(function(err) {
        res.json(err);
    });
});

// route to create comment
app.post('/articles/:id', function(req, res) {

    var articleId = req.param.id
    Comments
        .create(req.body)
        .then(function(dbComment) {
            return Article.findOneAndUpdate({_id: req.params.id}, { $push: {Comments: dbComment._id}}, {new: true})
        })
        .then(function(dbArticle) {
            res.json(dbArticle)
        })
        .catch(function(err) {
            res.json(err)
        })
        res.redirect('/articles' + articleId);
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