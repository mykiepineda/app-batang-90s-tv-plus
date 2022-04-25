const shows = require("../models/show");
const users = require("../models/user");

async function allShows() {
    return shows.find().sort({releaseInfo: 1, title: 1}).lean();
}

async function watchLists() {

    const user = await users.findOne({_id: "625cd09778a6145fe83d80dd"}).lean();

    if (user !== null) {
        return user.watchlists;
    }

    return [];
}

function initTopNavBar() {
    return async function (req, res, next) {
        res.locals.allShows = await allShows();
        res.locals.myWatchist = await watchLists();
        next();
    }
}


module.exports = initTopNavBar;