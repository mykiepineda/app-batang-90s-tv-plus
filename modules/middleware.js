const shows = require("../models/show.js");

function showsDropdown() {

    return async function(req, res, next) {
        res.locals.allShows = await shows.find().sort({_id: 1}).lean();
        next();
    }
}

module.exports = showsDropdown;