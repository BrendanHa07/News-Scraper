var mongoose = require('mongoose');

// save a reference to the schema constructor
var Schema = mongoose.Schema;

// create CommentSchema object
var CommentSchema = new Schema({
    // author of comment
    name: {
        type: String,
    },
    // comment body
    comment: 
        {
        type: String,
        }
});

// create the model
var Comments = mongoose.model("Comments", CommentSchema);

// exports the model
module.exports = Comments;

