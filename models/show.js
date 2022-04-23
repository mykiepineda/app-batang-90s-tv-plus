const mongoose = require("mongoose");
const slugify = require("slugify");

const showSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    summary: {
        type: String,
        required: true
    },
    cover: {
        type: String,
        required: true
    },
    logo: {
        type: String,
        required: true
    },
    background: {
        type: String,
        required: false
    },
    titleCard: {
        type: String,
        required: true
    },
    fandomWiki: {
        type: String,
        required: true
    },
    imdbUrl: {
        type: String,
        required: true
    },
    imdbRating: {
        type: String,
        required: true
    },
    releaseInfo: {
        type: String,
        required: true
    },
    averageRunningTime: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    seasons: {
        type: Array,
        required: true
    },
    details: {
        type: String,
        required: true
    }
});

showSchema.pre("validate", function(next) {
   if (this.title) {
       this.slug = slugify(this.title, {lower: true, strict: true});
   }
   next();
});

module.exports = mongoose.model("shows", showSchema);