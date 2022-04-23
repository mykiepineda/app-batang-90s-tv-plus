const express = require("express");
const app = express();
const port = process.env.PORT || 3000; // heroku to dynamically assign the port number during deployment or use 3000 when running locally

// Make the "public" folder available statically
const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

const mongoose = require("mongoose");
const videos = require("./models/video");
const shows = require("./models/show");
const users = require("./models/user");
const mockDatabase = require("./modules/mock-database");
const database = "batang-90s-tv-plus";
mongoose.connect(`mongodb+srv://mykiepineda:P1n3d%40j0hN@cluster0.omg3p.mongodb.net/${database}?retryWrites=true&w=majority`);

const handlebars = require("express-handlebars");
app.engine("handlebars", handlebars.engine({defaultLayout: "main", helpers: require("./modules/handlebars-helpers")}));
app.set("view engine", "handlebars");

const AWS = require("aws-sdk");

const wasabiEndpoint = new AWS.Endpoint("s3.ap-northeast-2.wasabisys.com");
const wasabiBucket = "batang-90s-tv-plus";

const showsDropdown = require("./modules/middleware");

const adminUserId = "625cd09778a6145fe83d80dd";

// TODO: Currently, origin is an AWS S3 bucket. Once Wasabi trial is over and objects can be make publicly, update AWS CloudFront to use this as the origin instead
const cdnRootUrl = "https://d2ku9lxqk7qrgi.cloudfront.net";

AWS.config.update({
    accessKeyId: "Z5QQ38VNUCU81ANC8NZE",
    secretAccessKey: "DmJTppTMTEbXJi8KIlEk1i2mteWtKBAp3hYHrdWV",
    endpoint: wasabiEndpoint,
    region: "ap-southeast-2"
});

app.get("/", showsDropdown(), async function (req, res) {

    res.locals.suggestions = await shows.find().sort({releaseInfo: 1, title: 1}).lean();
    res.locals.cdnRootUrl = cdnRootUrl;

    res.render("home");

});

app.get("/show/:id", showsDropdown(), async function (req, res) {

    const showId = req.params.id;

    res.locals.showId = showId;
    res.locals.show = await shows.findOne({_id: showId}).lean();
    res.locals.myWatchlist = [];
    res.locals.inWatchlist = false;
    res.locals.cdnRootUrl = cdnRootUrl;

    const userDoc = await users.findOne({_id: adminUserId}).lean();

    if (userDoc !== null) {

        const myWatchlist = userDoc.watchlists;

        if (myWatchlist.length > 0) {
            for (let i = 0; i < myWatchlist.length; i++) {
                const myWatchlistShow = myWatchlist[i];
                if (myWatchlistShow._id === showId) {
                    res.locals.inWatchlist = true;
                }
                res.locals.myWatchlist.push({
                    id: myWatchlistShow._id,
                    title: myWatchlistShow.title,
                    releaseInfo: myWatchlistShow.releaseInfo
                });
            }
        }
    }

    // return other shows
    res.locals.suggestions = await shows.find().where("_id").ne(showId).sort({releaseInfo: 1, title: 1}).lean();

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

    res.render("show");

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
    res.locals.show = await shows.findOne({_id: showId}).lean();
    res.locals.cdnRootUrl = cdnRootUrl;

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
        Bucket: wasabiBucket,
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

async function addRemoveToWatchlist(add, userId, showId) {

    const userDoc = await users.findOne({_id: userId}).lean();

    if (userDoc !== null) {

        const showToBeAdded = await shows.findOne({_id: showId}).lean();
        let updatedWatchList = userDoc.watchlists;
        let found = false;
        let index = -1;

        for (let i = 0; i < updatedWatchList.length; i++) {
            if (updatedWatchList[i]._id === showId) {
                found = true;
                index = i;
                break;
            }
        }
        if (found) {
            updatedWatchList.splice(index, 1);
        } else {
            updatedWatchList.push(showToBeAdded);
        }

        await users.findOneAndUpdate(
            {_id: userId},
            {$set: {
                watchlists: updatedWatchList
            }});

    }

}

app.get("/watchlist/add/:showId", async function (req, res) {

    const showId = req.params.showId;

    // TODO: Pass in logged-in user
    await addRemoveToWatchlist(true, adminUserId, showId);

    res.redirect(`/show/${showId}`);

});

app.get("/watchlist/remove/:showId", async function (req, res) {

    const showId = req.params.showId;

    // TODO: Pass in logged-in user
    await addRemoveToWatchlist(false, adminUserId, showId);

    res.redirect(`/show/${showId}`);

});

app.get("/initialise-database", async function (req, res) {

    const db = mongoose.connection;

    let message = "1. start database initialisation...";

    await db.dropCollection("shows");
    message += "\n2. shows collection dropped";

    const showsMockData = mockDatabase.getShows();
    await shows.insertMany(showsMockData);
    message += `\n3. inserted ${showsMockData.length} documents to shows collection`;

    await db.dropCollection("videos");
    message += "\n3. videos collection dropped";

    const episodesMockData = mockDatabase.getEpisodes();
    await videos.insertMany(episodesMockData);
    message += `\n4. inserted ${episodesMockData.length} documents to videos collection`;

    // await db.dropCollection("users");
    // await users.insertMany([{name: "Mykie"}]);

    message += "\n5. end database initialisation.";

    res.json({message: message});
});

app.listen(port, function () {
    if (process.env.URL !== undefined) {
        console.log(`Environment URL = ${process.env.URL}`);
    }
    console.log(`App listening on port ${port}`);
});