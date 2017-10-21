var mongoose = require('mongoose');

// save a reference to the schema constructor
var Schema = mongoose.Schema;

// create CommentSchema object
var CommentSchema = new Schema({
    // author of comment
    name: {
        type: String,
        required: true
    },
    // comment body
    body: {
        type: String,
        required: true
    }
});

// create the model
var Comments = mongoose.model("Comment", CommentSchema);

// exports the model
module.exports = Comments;

