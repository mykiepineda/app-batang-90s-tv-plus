const fs = require("fs");

function getShows() {
    return JSON.parse(fs.readFileSync("./data/shows.json", "utf-8"));
}

function getEpisodes() {
    const numberOfShows = getShows().length;
    let episodes = [];
    for (let i = 1; i <= numberOfShows; i++) {
        const temp = JSON.parse(fs.readFileSync(`./data/episodes/${i}.json`, "utf-8"));
        if (i === 1) {
            episodes = temp;
        } else {
            episodes = episodes.concat(temp);
        }
    }
    return episodes;
}

module.exports = {
    getShows,
    getEpisodes
}