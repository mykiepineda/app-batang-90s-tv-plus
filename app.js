const express = require("express");
const app = express();

const path = require("path");
app.use(express.static(path.join(__dirname, "public"))); // Make the "public" folder available statically

require("dotenv").config({path: "process.env"});
const port = (process.env.NODE_ENV === "development" ? 3000 : process.env.PORT);

const mongoose = require("mongoose");
const videos = require("./models/video");
const shows = require("./models/show");
const categories = require("./models/category");
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
const initTopNavBar = require("./modules/middleware");

app.get("/", initTopNavBar(), async function (req, res) {

    res.locals.atHome = true;
    res.locals.fileSourceRootUrl = fileSourceRootUrl;

    const user = await users.findOne({_id: adminUserId})
        .populate({
            path: "continueWatching.episodeId",
            model: "videos",
            populate: {path: "showId", model: "shows"}
        })
        .lean();
    if (user !== null) {
        res.locals.userName = user.name;
        const cwList = user.continueWatching;
        cwList.sort(function (a, b) {
            if (b.dateTimeStamp === a.dateTimeStamp) {
                return 0;
            } else if (b.dateTimeStamp > a.dateTimeStamp) {
                return 1
            }
            return -1;
        });
        res.locals.continueWatching = cwList;
        if (cwList.length > 0) {
            const cardsPerPage = 5;
            let pagination = [];
            let videoList = [];
            let pageNbr = 1;

            for (let i = 0; i < cwList.length; i++) {

                const cwVideo = cwList[i].episodeId;

                if (videoList.length < cardsPerPage) {
                    videoList.push(cwVideo);
                }

                if (videoList.length === cardsPerPage || i === cwList.length - 1) {
                    pagination.push({
                        page: pageNbr,
                        season: cwVideo.season,
                        videos: videoList
                    });
                    pageNbr++;
                    videoList = [];
                }

            }
            res.locals.pagination = pagination;
        }
    }

    res.locals.suggestions = await shows.find().sort({releaseInfo: 1, title: 1}).lean();
    res.locals.categories = await categories.find().sort({description: 1}).lean();

    res.render("home");

});

app.get("/show/:slug", initTopNavBar(), async function (req, res) {

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
        res.locals.inWatchlist = false;

        const user = await users.findOne({_id: adminUserId})
            .populate({
                path: "continueWatching.episodeId",
                model: "videos",
                populate: {path: "showId", model: "shows"}
            })
            .lean();

        if (user !== null) {

            const myWatchlist = user.watchlists;

            if (myWatchlist.length > 0) {
                for (let i = 0; i < myWatchlist.length; i++) {
                    const myWatchlistShow = myWatchlist[i];
                    if (myWatchlistShow._id === showId) {
                        res.locals.inWatchlist = true;
                        break;
                    }
                }
            }

            const cwList = user.continueWatching;

            if (cwList.length > 0) {
                for (let i = 0; i < cwList.length; i++) {
                    const cwEpisode = cwList[i];
                    if (cwEpisode.showId === showId) {
                        res.locals.continueWatching = cwEpisode.episodeId.episode;
                        break;
                    }
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

async function saveContinueWatching(video) {

    await users.findOneAndUpdate(
        {
            _id: adminUserId,
            "continueWatching.showId": {$ne: video.showId}
        },
        {
            $addToSet: {
                continueWatching: {
                    showId: video.showId,
                    episodeId: null
                }
            }
        }
    );

    await users.findOneAndUpdate(
        {_id: adminUserId},
        {
            $set: {
                "continueWatching.$[elem].episodeId": video._id,
                "continueWatching.$[elem].dateTimeStamp": Date.now()
            }
        },
        {arrayFilters: [{"elem.showId": video.showId}]}
    );

}

app.get("/show/:slug/episode/:id", initTopNavBar(), async function (req, res) {

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

            await saveContinueWatching(video);

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

        const addThisShow = await shows.findOne({slug: slug}).lean();

        if (add) {
            await users.findOneAndUpdate(
                {_id: userId},
                {$addToSet: {watchlists: addThisShow}}
            );
        } else {
            await users.findOneAndUpdate(
                {_id: userId},
                {$pull: {watchlists: {_id: addThisShow._id}}}
            )
        }

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
    let seqNbr = 1;
    let message = `${seqNbr++}. start database initialisation...`;

    await db.dropCollection("categories");
    message += `\n${seqNbr++}. categories collection dropped`;

    const categoriesMockData = mockDatabase.getCategories();
    await categories.insertMany(categoriesMockData);
    message += `\n${seqNbr++}. inserted ${categoriesMockData.length} documents to categories collection`;

    await db.dropCollection("shows");
    message += `\n${seqNbr++}. shows collection dropped`;

    const showsMockData = mockDatabase.getShows();
    await shows.insertMany(showsMockData);
    message += `\n${seqNbr++}. inserted ${showsMockData.length} documents to shows collection`;

    await db.dropCollection("videos");
    message += `\n${seqNbr++}. videos collection dropped`;

    const episodesMockData = mockDatabase.getEpisodes();
    await videos.insertMany(episodesMockData);
    message += `\n${seqNbr++}. inserted ${episodesMockData.length} documents to videos collection`;

    // await db.dropCollection("users");
    await users.findOneAndUpdate({_id: adminUserId}, {$set: {watchlists: [], continueWatching: []}});

    message += `\n${seqNbr++}. end database initialisation.`;

    res.json({message: message});
});

app.get("/downloader", function (req, res) {
    // downloads show thumbnails from crunchyroll image server
    const http = require("https");
    const fs = require("fs");
    const fileIds = [
        "e8c6e9cfcee9bffb449de3845cf14776",
        "e2e93c2dd0d5960cf9873c903955ce82",
        "aa107ce0403652f47d8ef62ce180c89c",
        "e56d4b7372c04bb9d872b979c8968ec4",
        "068e570cb65e93a56baf1d8b59229479",
        "5102978f6d645ce8637147d26d4c8d25",
        "7c576bbe0f2912057f07e747f3cfdf87",
        "054dab49c79bc00ec576086f37f07ac9",
        "d5b6b4383f859633d0b82e645d2a9349",
        "fa106f75a2c520f8adb5d184c03fe10c",
        "f019bcacdc7fffcbe9d71c5fe5a0dd1f",
        "57a379cc4e1685fa9921deba98255a90",
        "9b9baa7ac6f92236d2508527219969dd",
        "0f0b70143b6833ea75c69fe53a861723",
        "1f665be52194bd69aa285d0c3c1bc400",
        "18cb48b5280f184d2515a31c57020621",
        "d9cda0b24a696d9265ffa2b0569894dc",
        "ad8c9b7306db8b7af6290a3c3fb00047",
        "850561a22096a0220275c4b167dc0845",
        "17c5532ebead131d066bb5e8062bb951",
        "1529b73bda1f41e2c949572a63724c28",
        "12f2516a0c29b2f9484262734d80488a",
        "2ad5eec90a266d317efefcec1d6f9c11",
        "04e77a390aac62b02b2cb990cbb342d2",
        "39b5867eb2509719ae2efac84f640c71",
        "cdc5b693fa90583ba9148ccd8600a8fd",
        "383d8bc87d993d7875b8d1a77038e3b0",
        "383d8bc87d993d7875b8d1a77038e3b0",
        "152ce8ac0dae410e0d2cc5603f878bc3",
        "dfd604e8a582303303488f9e83daca88",
        "ad036fd1ae3e0eff413120e019db34d2",
        "ba51d52ea1949bfae34c455b66bef132",
        "4184b66e5a7c3722c3c02d1dd3123649",
        "efa274ba40c0880c91d765bfe190efd3",
        "2a41b678234782f4da7d4319255d4cd7",
        "74588c7facef5cb38bf0fa7beaef90cf",
        "6f260714ab025ea81e2288f4477022fa",
        "7400ab4498afa615fef96ed0e2290783",
        "d77d22bd24cd96b5268819bda6d3b79a",
        "0f63dbdb50dd87192a71cd36cd62ffcc",
        "b416abcd19833f39d941e54f1b4655d4",
        "1c3fca2b1e2b3c6374239b26769ec079",
        "a0b1ccc8b592e4a1975a46841d3d18d8",
        "f91dde9822f1fc2816af9bbddd441904",
        "1a6f0ace38a25bf9bbfd6465c1938955",
        "bb347bb2c95f6a58b209d0a5906927e9",
        "3860b73455609bf821d3b8ac98fefbb1",
        "859ba1f9f4b9b2dd8b70dfb6e3c64c21",
        "3933c60fd34e5a8196b93d50f1d3b798",
        "c277ce7bc6d4c9026cdb551d246804a9",
        "3e5dd1d52a83c253badec315726ce912",
        "ec963c1e9e066557185ef48f01caaab3",
        "f5be7d2230c6427dd0d62b3bca6ba416",
        "a2108d108a61f990346fd893670f820b",
        "5ea05219ad4e49977fbaca6f415f96d5",
        "15be837de65e7a6322bc119bbf283b99",
        "85d3976d0ba9519c95a22f9523120d68",
        "35ffbc2f943588b29b8badc11df2b3b8",
        "d7b55e2a6f3439e1fc1bb9f470b32d72",
        "9b2eb0aee8c34d31cc4bedd8355ebc3c",
        "5cfd3278ed709bf4a4a03f0826eb2c45",
        "9d41c8700c91deeb35b63ac74f7486d3",
        "2c1bdd221550db1f85c5fd3bd9570df2",
        "b176e8b074e403821af555c140f08f08",
        "dd8d275eaee64be069257a9d268ba07d",
        "e1e19139f7a3a5399067eaae78638789",
        "32a9e051fa3aaa1572a9cb32efde70d1",
        "692c2cce2daade5f9b3fc26f9e1b5df0",
        "83cffa927779bd0fe045d69608217bbd",
        "6a10d671331f015f58eb8c141034a19f",
        "e6a363ce41dc0275010fda2374441f4e",
        "0216189283c07628198fea0a1769116d",
        "46836a7f61f909a4e891af48bc0de54f",
        "a95e1e8bcf95da34ee724002e6963f0c",
        "91fef84c65676591191f7916d3f5a8b8",
        "1c13d839638d5e619f4dc57f425bec1d",
        "018dfddb5fc468e49e2f4c72a8208112",
        "984b03a7220016febccb5fdcb2ea3503",
        "f9cdda06f63714e10d95798736c9b02b",
        "0ba8a90b82451c17d66c075f71e75ec3",
        "9e07621e6a737c3c1437e4f7be34e2bc",
        "d3aa6cfbdf5562c089f9ac40cac30e06",
        "2e76d2726c86a41fddfa17aaf9157e84",
        "b8227b1ae9f77f95e5b4e769a2195c01",
        "71dc1da5d6328e8db904080d3c96db96",
        "06da2373281aae44b1b2930f9bbf6102",
        "e80498f4c2bd0685ddefe20752299616",
        "b647bef5c0505465fc77b5555c0c4d0c",
        "4641a44b16f5e8982b04dacd2f36d77d",
        "d11157962e93a0acb719c9cc9064ebcf",
        "18a7c9e6eb795368dcd2c299ba1ccf96",
        "d7adc1d1f63bb0c3534963414766c795",
        "6e0562605ec94297cb5b99be0c861e9b",
        "28ec768bb8c7b54e679c27e6eae03854",
        "36725836e283b2a89a8a9d6c5c061dc0",
        "993acdfa7957a95ae4814adfe3f6fd0b",
        "d35601d891ca280aa45b57b050f6e9ee",
        "05d821ea979b0bf23616c93506f28d25",
        "b5769c9d90b12a17f4d7413ea699ae70",
        "3a2a42017fc260553b5f3ebad4864e0f",
        "7c7a4b4c358ac5278612fd760a7f88ea",
        "23a6b515bda2b7b6a04158f41bc42a67",
        "32539710dcb6064154799d48f27e15f0",
        "14e92306fb3c61236f09d647e3bab59a",
        "144cf8833129168d867c614f12bc1652",
        "ac8e995104529f2b5b2255f24077abd0",
        "aa26834bf7c201ac4f94cf86baa43adb",
        "55bf08e407f2b3220e67a3b9462b640f",
        "35872aa65a85e8ac347a2dec85676331",
        "89026e63ba4c7a16078d09c86ab60083",
        "56e2bb48c7fd8b3155eb828ff10eb294",
        "476c17c68662a52a3354b20c3ba55abd"
    ];

    for (let i = 0; i < fileIds.length; i++) {
        const id = (i+1).toString();
        const fileName = id.padStart(3, "0");
        const targetFile = fs.createWriteStream(`./public/local_images/shows/19/thumbnails/${fileName}.jpeg`);
        http.get(`https://beta.crunchyroll.com/imgsrv/display/thumbnail/320x180/catalog/crunchyroll/${fileIds[i]}.jpeg`, function (response) {
            response.pipe(targetFile);
            // after download completed close filestream
            targetFile.on("finish", () => {
                targetFile.close();
            });
        });
    }
    res.send({message: `Completed downloading ${fileIds.length} files.`});
});

app.listen(port, function () {
    console.log(`Running environment: ${process.env.NODE_ENV}`);
    console.log(`App listening on port ${port}`);
});