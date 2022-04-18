const mongoose = require("mongoose");

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
        ref: "videoSchema",
        required: false
    }
});

module.exports = mongoose.model("users", userSchema);