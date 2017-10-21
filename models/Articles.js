var mongoose = require('mongoose');

// save reference to schema constructor
var Schema = mongoose.Schema;

// Creating new schema object
var ArticleSchema = new Schema({
    // title of article
    title: {
        type: String,
        required: true,
        unique: true
    },
    // link to article
    link: {
        type: String,
        required: true,
        unique: true
    },
    
    // create relationship with comment model
    comment: {
        type: Schema.Types.ObjectId,
        ref: "Comments"
    }
});

// creates our model from the above schema
var Article = mongoose.model("Article", ArticleSchema);

// export the Article model
module.exports = Article;