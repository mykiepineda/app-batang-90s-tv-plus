const mongoose = require("mongoose");
const videoSchema = new mongoose.Schema({
    episode: {
        type: Number,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    airDate: {
        type: Date,
        required: true
    },
    synopsis: {
        type: String,
        required: true
    },
    thumbnail: {
        type: String,
        required: true
    },
    video: {
        type: String,
        required: true
    },
    season: {
        type: Number,
        required: true
    },
    showId: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model("videos", videoSchema);