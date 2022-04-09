const mongoose = require("mongoose");
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
    thumbnail: {
        type: String,
        required: true
    },
    imdbURL: {
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
    bucketFolder: {
        type: String,
        required: true
    },
    seasons: {
        type: Array,
        required: true
    }
});

module.exports = mongoose.model("shows", showSchema);