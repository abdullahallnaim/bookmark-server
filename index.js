const express = require('express')
const app = express()
const port = 5000
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const cors = require('cors');
// const fileUpload = require('express-fileupload');
require('dotenv').config()
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u5omi.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    // root
    app.get('/', (req, res) => {
        res.send('Hello World!')
    })
    const addNewUser = client.db("bookmark").collection("users");
    const addBookmark = client.db("bookmark").collection("bookmarks");
    // const addNewUser = client.db("MovieDatabase").collection("signup-info");
    // const addToFavourites = client.db("MovieDatabase").collection("favorite-movie");



    // add newuser
    app.post("/users", (req, res) => {
        const file = req.body.photoURL.file;
        // const photoURL = req.body.photoURL;
        // const newImg = file.data;
        // const encImg = file.toString('base64');
console.log(file)
// console.log(newImg)
// console.log(encImg)
        // var image = Buffer.from(file, 'base64')
        // console.log(image);
        const user = req.body;
        // user.photoURL = image
        console.log(user)
        // user.photoURL = image
        addNewUser.insertOne(user)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })
    // add bookmark
    app.post("/bookmark", (req, res) => {
        const bookmark = req.body;
        addBookmark.insertOne(bookmark)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
    })
    // query user
    app.get('/userinfo', (req, res) => {
        addNewUser.find({id : req.query.id})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })
    // query user
    app.get('/allusers', (req, res) => {
        addNewUser.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })
    // query bookmark
    app.get('/bookmarkinfo', (req, res) => {
        addBookmark.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })
    // get orderinfo
    app.get('/customersorderinfo', (req, res) => {
        addNewUser.find({})
            .toArray((err, documents) => {
                res.send(documents)
            })
    })
    // get review
    // app.get('/getreviewdata', (req, res) => {
    //     userReview.find({ title: req.query.title })
    //         .toArray((err, documents) => {
    //             res.send(documents)
    //         })
    // })
    // // get loggedin user review data
    // app.get('/getrateddata', (req, res) => {
    //     userReview.find({ username: req.query.username })
    //         .toArray((err, documents) => {
    //             res.send(documents)
    //         })
    // })
    // // get favoritelist
    // app.get('/getfavlist', (req, res) => {
    //     addToFavourites.find({ username: req.query.username })
    //         .toArray((err, documents) => {
    //             res.send(documents)
    //         })
    // })


});

app.listen(process.env.PORT || port)