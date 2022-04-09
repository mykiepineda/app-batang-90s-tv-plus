const express = require("express");
const app = express();
const port = process.env.PORT || 3000; // heroku to dynamically assign the port number during deployment or use 3000 when running locally

// Make the "public" folder available statically
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

const mongoose = require("mongoose");
const videos = require("./models/video");
const shows = require("./models/show");
const database = "my-streaming-site";
mongoose.connect(`mongodb+srv://mykiepineda:P1n3d%40j0hN@cluster0.omg3p.mongodb.net/${database}?retryWrites=true&w=majority`);

const handlebars = require("express-handlebars");
app.engine("handlebars", handlebars.engine({defaultLayout: "main", helpers: require("./modules/handlebars-helpers")}));
app.set("view engine", "handlebars");

const AWS = require("aws-sdk");
const suggestions = require("./mock_data/suggestions.json");

const wasabiEndpoint = new AWS.Endpoint("s3.ap-northeast-2.wasabisys.com");

const showsDropdown = require("./modules/middleware");

AWS.config.update({
    accessKeyId: "Z5QQ38VNUCU81ANC8NZE",
    secretAccessKey: "DmJTppTMTEbXJi8KIlEk1i2mteWtKBAp3hYHrdWV",
    endpoint: wasabiEndpoint,
    region: "ap-southeast-2"
});

app.get("/", function (req, res) {
    // TODO: Homepage. Redirect to Kamen Rider Black RX for now
    res.redirect("/show/01");
});

app.get("/show/:id", showsDropdown(), async function (req, res) {

    const showId = req.params.id;

    res.locals.showId = showId;
    res.locals.show = await shows.findOne({_id: showId}).lean();

    let filteredSuggestions = [];

    for (let i = 0; i < suggestions.length; i++) {
        if (suggestions[i].id !== showId) {
            filteredSuggestions.push(suggestions[i]);
        }
    }

    res.locals.suggestions = filteredSuggestions;

    const videoCollection = await videos.find({showId: showId}).sort({episode: 1}).lean();

    if (videoCollection.length > 0) {

        const cardsPerPage = 5;
        let pagination = [];
        let pageNbr = 1;
        let videoList = [];
        let tempVideoList = [];
        let prevSeason = videoCollection[0].season;

        for (let i = 0; i < videoCollection.length; i++) {

            const videoDocument = videoCollection[i];

            if (prevSeason !== videoDocument.season) {
                tempVideoList = videoList;
                videoList = [];
            }

            if (videoList.length < cardsPerPage) {
                videoList.push(videoDocument);
            }

            if (tempVideoList.length > 0) {
                pagination.push({
                    page: pageNbr,
                    season: prevSeason,
                    videos: tempVideoList
                });
                tempVideoList = [];
                pageNbr++;
            }

            if ((videoList.length === cardsPerPage) || (i === videoCollection.length - 1)) {
                pagination.push({
                    page: pageNbr,
                    season: videoDocument.season,
                    videos: videoList
                });
                videoList = [];
                pageNbr++;
            }

            prevSeason = videoDocument.season;

        }

        res.locals.pagination = pagination;

    }

    res.render("home");

})
;

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

app.get("/show/:showId/episode/:id", showsDropdown(), async function (req, res) {

    const showId = req.params.showId;
    const episodeId = req.params.id;

    let minEpisode = null;
    let maxEpisode = null;

    await videos.findOne({showId: showId}).sort({episode: 1}).then(function (doc) {
        minEpisode = doc.toJSON().episode;
    });
    await videos.findOne({showId: showId}).sort({episode: -1}).then(function (doc) {
        maxEpisode = doc.toJSON().episode;
    });

    await videos.find({showId: showId, episode: episodeId}).then(function (collection) {
        const video = collection[0].toJSON();
        res.locals.video = video;
        res.locals.prevEpisode = getOtherEpisode(video.episode, false);
        res.locals.nextEpisode = getOtherEpisode(video.episode, true);
        res.locals.reachedStart = (episodeId === minEpisode);
        res.locals.reachedEnd = (episodeId === maxEpisode);
    });

    res.locals.showId = showId;

    res.render("episode");
});

async function getContentLength(s3, params) {

    let videoSize = 0;

    const promise = new Promise(function (resolve, reject) {
        s3.headObject(params, function (err, data) {
            if (err) {
                reject(0);
            }
            resolve(data.ContentLength);
        });
    });

    const thenPromise = promise.then(function (value) {
        videoSize = value;
    });

    await thenPromise;

    return videoSize;

}

app.get("/video/:objectId", async function (req, res, next) {

    // TODO: https://github.com/aws/aws-sdk-js/issues/2087
    // Getting timeout error when seeking video (multiple canceled requests in browser developer/network mode)

    // Ensure there is a range given for the video
    const range = req.headers.range;
    if (!range) {
        return res.status(400).send("Requires Range Header");
    }

    const episode = await videos.findOne({_id: req.params.objectId}).lean();
    const show = await shows.findOne({_id: episode.showId}).lean();
    const key = `${show.bucketFolder}/${episode.episode}.mp4`;

    const s3 = new AWS.S3();

    const params = {
        Bucket: "batang-90s-tv-plus",
        Key: key
    };

    // Check first the content-length of the file in s3 bucket so that we can calculate for the Byte-Range
    const videoSize = await getContentLength(s3, params);

    // Calculate for Byte-Range
    const CHUNK_SIZE = 10 ** 6; // 1 MB
    const start = Number(range.replace(/\D/g, "")); // Strips numeric value from ie. "bytes=1000001-"
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    // Once we know the content-length, start requesting for the actual s3 object in chunks
    params.Range = `bytes=${start}-${end}`;

    const stream = s3.getObject(params).createReadStream();

    // Create headers
    const contentLength = end - start + 1;
    const headers = {
        "Content-Range": `bytes ${start}-${end}/${videoSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": contentLength,
        "Content-Type": "video/mp4"
    };

    // HTTP Status 206 for Partial Content
    res.writeHead(206, headers);

    // Pipe the s3 object to the response
    stream.pipe(res);

    stream.on("error", function (error) {
        console.log(error);
        res.end();
    });

});

app.listen(port, function () {
    if (process.env.URL !== undefined) {
        console.log(`Environment URL = ${process.env.URL}`);
    }
    console.log(`App listening on port ${port}`);
});