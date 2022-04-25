const mongoose = require("mongoose");

const continueWatchingSchema = new mongoose.Schema({
    showId: {
        type: String,
        required: true
    },
    episodeId: {
        type: String,
        required: true
    }
});

const userSchema = new mongoose.Schema({
    name: {
        type: mongoose.Schema.Types.String,
        required: true
    },
    watchlists: {
        type: mongoose.Schema.Types.Array,
        ref: "showSchema",
        required: false
    },
    continueWatching: {
        type: mongoose.Schema.Types.Array,
        ref: "continueWatchingSchema",
        required: false
    }
});

module.exports = mongoose.model("users", userSchema);