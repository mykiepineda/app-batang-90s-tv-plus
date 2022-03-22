const express = require("express");
const fs = require("fs");
const app = express();
const port = 3000;

// Make the "public" folder available statically
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

const mongoose = require("mongoose");
const videos = require("./models/video");
const database = "my-streaming-site";
mongoose.connect(`mongodb+srv://mykiepineda:P1n3d%40j0hN@cluster0.omg3p.mongodb.net/${database}?retryWrites=true&w=majority`);

const handlebars = require("express-handlebars");
app.engine("handlebars", handlebars.engine({defaultLayout: "main", helpers: require("./modules/handlebars-helpers")}));
app.set("view engine", "handlebars");

app.use("/css", express.static(path.join(__dirname, "node_modules/bootstrap/dist/css")));
app.use("/js", express.static(path.join(__dirname, "node_modules/bootstrap/dist/js")));
app.use("/jquery", express.static(path.join(__dirname, "node_modules/jquery/dist")));

app.get("/", function (req, res) {

    let sortBy = req.query.sortBy;

    if (sortBy === undefined) {
        sortBy = "episode";
    }

    // TODO: put in a function
    videos.find().sort(sortBy).lean().exec(function (err, collection) {

        let pagination = [];
        let page = 1;
        let videoList = [];
        let j = 1;
        const cardsPerPage = 5; // varies depending on screen width

        for (let i = 0; i <= collection.length; i++) {
            if (i > 0 && (i % cardsPerPage === 0 || i === collection.length)) {
                pagination.push({
                    page: page,
                    season: j,
                    videos: videoList
                });
                if (page % 3 === 0) {
                    j++;
                }
                page++;
                videoList = [];
            }
            if (i < collection.length) {
                videoList.push(collection[i]);
            }
        }

        res.locals.pagination = pagination;
        res.render("home");
    });

});

app.get('/bookmarked', async function (req, res) {
    res.locals.videos = await videos.find({bookmarked: true}).sort("episode").lean();

    res.render("home");
});

function getOtherEpisode(episode, next) {

    let intEpisode = parseInt(episode);

    if (next) {
        intEpisode++;
    } else {
        intEpisode--;
    }

    if (intEpisode < 10) {
        return `0${intEpisode}`;
    }

    return intEpisode.toString();
}

app.get("/episode/:id", async function (req, res) {

    const episodeId = req.params.id;

    let minEpisode = null;
    let maxEpisode = null;

    await videos.findOne().sort({episode: 1}).then(function (doc) {
        minEpisode = doc.toJSON().episode;
    });
    await videos.findOne().sort({episode: -1}).then(function (doc) {
        maxEpisode = doc.toJSON().episode;
    });

    await videos.find({"episode": episodeId}).then(function (collection) {
        const video = collection[0].toJSON();
        res.locals.episode = video.episode;
        res.locals.title = video.title;
        res.locals.synopsis = video.synopsis;
        res.locals.bookmarked = video.bookmarked;
        res.locals.prevEpisode = getOtherEpisode(video.episode, false);
        res.locals.nextEpisode = getOtherEpisode(video.episode, true);
        res.locals.reachedStart = (episodeId === minEpisode);
        res.locals.reachedEnd = (episodeId === maxEpisode);
    });

    res.render("episode");
});

app.get("/video/:episode", function (req, res) {

    const videoId = req.params.episode;

    // Ensure there is a range given for the video
    const range = req.headers.range;
    if (!range) {
        res.status(400).send("Requires Range header");
    }

    // get video stats (about 61MB)
    const videoPath = __dirname + `/videos/${videoId}.mp4`;
    const videoSize = fs.statSync(videoPath).size;

    // Parse Range
    // Example: "bytes=32324-"
    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ""));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    // Create headers
    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4",
    };

    // HTTP Status 206 for Partial Content
    res.writeHead(206, headers);

    // create video read stream for this particular chunk
    const videoStream = fs.createReadStream(videoPath, {start, end});

    // Stream the video chunk to the client
    videoStream.pipe(res);
});

app.get("/bookmark/:episode", async function (req, res) {

    const episodeId = req.params.episode;
    let bookmarked = null;

    await videos.findOne({episode: episodeId}).then(function (doc) {
        bookmarked = doc.toJSON().bookmarked;
    });

    await videos.updateOne({episode: episodeId}, {bookmarked: !bookmarked});

    res.redirect(`/episode/${episodeId}`);
});

app.listen(port, function () {
    console.log(`App listening on port ${port}`);
});