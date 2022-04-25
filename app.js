const express = require("express");
const app = express();

const path = require("path");
app.use(express.static(path.join(__dirname, "public"))); // Make the "public" folder available statically

require("dotenv").config({path: "process.env"});
const port = (process.env.NODE_ENV === "development" ? 3000 : process.env.PORT);

const mongoose = require("mongoose");
const videos = require("./models/video");
const shows = require("./models/show");
const users = require("./models/user");
const mockDatabase = require("./modules/mock-database");

mongoose.connect(`mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_CLUSTER}/${process.env.MONGODB_DATABASE}?retryWrites=true&w=majority`).then(function () {
    console.log("Connected successfully to database");
});
const adminUserId = process.env.MONGODB_ADMIN_USER_ID;

const handlebars = require("express-handlebars");
app.engine("handlebars", handlebars.engine({defaultLayout: "main", helpers: require("./modules/handlebars-helpers")}));
app.set("view engine", "handlebars");

const AWS = require("aws-sdk");
AWS.config.update({
    accessKeyId: process.env.WASABI_ACCESS_KEY_ID,
    secretAccessKey: process.env.WASABI_SECRET_ACCESS_KEY,
    endpoint: new AWS.Endpoint(process.env.WASABI_SERVICE_URL),
    region: process.env.WASABI_REGION
});

const wasabiBucket = process.env.WASABI_BUCKET;
const fileSourceRootUrl = (process.env.NODE_ENV === "development" ? "/local_" : `${process.env.CLOUDFRONT_ROOT_URL}/`);
const showsDropdown = require("./modules/middleware");

app.get("/", showsDropdown(), async function (req, res) {
    res.locals.fileSourceRootUrl = fileSourceRootUrl;
    res.locals.suggestions = await shows.find().sort({releaseInfo: 1, title: 1}).lean();
    res.render("home");
});

app.get("/show/:slug", showsDropdown(), async function (req, res) {

    res.locals.fileSourceRootUrl = fileSourceRootUrl;

    const show = await shows.findOne({slug: req.params.slug}).lean();

    if (show === null) {
        res.locals.errorMessage = "Show not found";
        res.render("error");
    } else {

        const showId = show._id;

        res.locals.show = show;
        res.locals.showId = showId;
        res.locals.displayShowBackground = true;
        res.locals.myWatchlist = [];
        res.locals.inWatchlist = false;

        const userDoc = await users.findOne({_id: adminUserId}).lean();

        if (userDoc !== null) {

            const myWatchlist = userDoc.watchlists;

            if (myWatchlist.length > 0) {
                for (let i = 0; i < myWatchlist.length; i++) {
                    const myWatchlistShow = myWatchlist[i];
                    if (myWatchlistShow._id === showId) {
                        res.locals.inWatchlist = true;
                    }
                    res.locals.myWatchlist.push(myWatchlistShow);
                }
            }
        }

        // return other shows
        res.locals.suggestions = await shows.find().where("_id").ne(showId).sort({releaseInfo: 1, title: 1}).lean();

        // TODO: modify videos model by renaming showId to show?
        const videoCollection = await videos.find({showId: showId}).populate({
            path: "showId",
            model: "shows"
        }).sort({episode: 1}).lean();

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

    }
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

app.get("/show/:slug/episode/:id", showsDropdown(), async function (req, res) {

    res.locals.fileSourceRootUrl = fileSourceRootUrl;

    const show = await shows.findOne({slug: req.params.slug}).lean();

    if (show === null) {
        res.locals.errorMessage = "Show not found";
        res.render("error");
    } else {

        const showId = show._id;
        const episodeId = req.params.id;

        const video = await videos.findOne({showId: showId, episode: episodeId}).lean();

        if (video === null) {
            res.locals.errorMessage = "Episode not found";
            res.render("error");
        } else {

            let minEpisode = null;
            let maxEpisode = null;

            // TODO: Find max and min episode in one query?
            await videos.findOne({showId: showId}).sort({episode: 1}).then(function (doc) {
                minEpisode = doc.toJSON().episode;
            });
            await videos.findOne({showId: showId}).sort({episode: -1}).then(function (doc) {
                maxEpisode = doc.toJSON().episode;
            });

            res.locals.video = video;
            res.locals.prevEpisode = getOtherEpisode(video.episode, false);
            res.locals.nextEpisode = getOtherEpisode(video.episode, true);
            res.locals.reachedStart = (episodeId === minEpisode);
            res.locals.reachedEnd = (episodeId === maxEpisode);
            res.locals.showId = showId;
            res.locals.show = show;

            res.render("episode");
        }
    }
});

app.get("/video/:objectId", async function (req, res, next) {

    // Ensure there is a range given for the video
    const range = req.headers.range;
    if (!range) {
        return res.status(400).send("Requires Range Header");
    }

    const episode = await videos.findOne({_id: req.params.objectId}).lean();
    const show = await shows.findOne({_id: episode.showId}).lean();
    const key = `${show.slug}/${episode.episode}.mp4`;

    const s3 = new AWS.S3();

    const params = {
        Bucket: wasabiBucket,
        Key: key
    };

    let videoSize;

    // Check first the content-length of the file in s3 bucket so that we can calculate for the Byte-Range
    try {
        const data = await s3.headObject(params).promise();
        videoSize = data.ContentLength;
    } catch (error) {
        videoSize = 0;
        console.log(`Error encountered while serving ${params.Bucket}/${params.Key}: ${error}`);
    }

    if (videoSize === 0) {
        return res.status(404).send("File not found");
    }

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

    stream.on("error", function (error) {
        // Request is stuck in pending and eventually errors out when seeking video (multiple canceled requests in browser developer mode network tab)
        // I think it's linked to this open bug, https://github.com/aws/aws-sdk-js/issues/2087
        console.log(`Error encountered while serving ${params.Bucket}/${params.Key}: ${error}`);
        res.end();
    });

    // Pipe the s3 object to the response
    stream.pipe(res);

});

async function addRemoveToWatchlist(add, userId, slug) {

    const userDoc = await users.findOne({_id: userId}).lean();

    if (userDoc !== null) {

        const showToBeAdded = await shows.findOne({slug: slug}).lean();
        const showId = showToBeAdded._id;
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
            {
                $set: {
                    watchlists: updatedWatchList
                }
            });

    }

}

app.get(["/watchlist/add/:slug", "/watchlist/remove/:slug"], async function (req, res) {

    const slug = req.params.slug;

    // TODO: Pass in logged-in user
    await addRemoveToWatchlist((req.url.startsWith("/watchlist/add/", 0)), adminUserId, slug);

    res.redirect(`/show/${slug}`);

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
    await users.findOneAndUpdate({_id: adminUserId}, {$set: {watchlists: []}});

    message += "\n5. end database initialisation.";

    res.json({message: message});
});

app.listen(port, function () {
    console.log(`Running environment: ${process.env.NODE_ENV}`);
    console.log(`App listening on port ${port}`);
});