const express = require('express')
const app = express()
const port = 5000
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const cors = require('cors');
const fileUpload = require('express-fileupload');
require('dotenv').config()
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(fileUpload());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.u5omi.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
    // root
    app.get('/', (req, res) => {
        res.send('Hello World!')
    })
    console.log('db connection success')
    const addNewUser = client.db("bookmark").collection("users");
    const addBookmark = client.db("bookmark").collection("bookmarks");
    // const addNewUser = client.db("MovieDatabase").collection("signup-info");
    // const addToFavourites = client.db("MovieDatabase").collection("favorite-movie");



    // add newuser
    app.post("/users", (req, res) => {
        if(req.body.type == 'gf'){
            addNewUser.insertOne(req.body)
            .then(result => {
                res.send(result.insertedCount > 0);
            })
        }
        else{
            console.log(req.body)
            const imgFile = req.files.file;
            const fname = req.body.fname
            const lname = req.body.lname
            const email = req.body.email
            const id = req.body.id
            const password = req.body.password
            const addImg = imgFile.data;
            const encImage = addImg.toString('base64');
            // console.log(req.files)
            // console.log(req.body)
            var photo = {
                contentType: imgFile.mimetype,
                size: imgFile.size,
                image: Buffer.from(encImage, 'base64')
            };
            let userInf = {
            name : fname + ' ' + lname, 
            email : email, 
            password : password, 
            photo: photo, 
            id : id}
            
            addNewUser.insertOne(userInf)
                .then(result => {
                    res.send(result.insertedCount > 0);
                    console.log('user added successfully')
                })
        }
        
    })
    app.put("/user", (req, res) => {
        console.log(req.body)
        if (req.body.type == 'edit') {
            if (req.body.name) {
                console.log('only name')
                addNewUser.updateOne({ id: req.body.id }, { $set: { name: req.body.name } }, (err, result) => {
                    if (err) {
                        console.log('name failed')
                    } else {
                        console.log('only name changed')
                    }
                })
            }
            else if (req.body.email) {
                console.log('only email')
                addNewUser.updateOne({ id: req.body.id }, { $set: { email: req.body.email } }, (err, result) => {
                    if (err) {
                        console.log('email failed')
                    } else {
                        console.log('only email changed')
                    }
                })
            } 
            else if (req.body.email && req.body.name) {
                console.log('all')
                addNewUser.updateOne({ id: req.body.id }, { $set: { name: req.body.name, email: req.body.email } }, (err, result) => {
                    if (err) {
                        console.log('all failed')
                    } else {
                        console.log('all changed')
                    }
                })
            }
        }
        if (req.body.type == 'pass') {
            addNewUser.updateMany({ id: req.body.id }, { $set: { password: req.body.password } }, (err, result) => {
                if (err) {
                    console.log('failed')
                } else {
                    console.log('success')
                }
            })
        }

    })
    // app.post("/users", (req, res) => {
    //     addNewUser.updateOne({id : req.body.id}, {$set : {name : req.body.name, email : req.body.email, password : req.body.password}}, (err, result) => {
    //         console.log(err)
    //         console.log(result)
    //                     })
    // })
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
        const query = req.query.id
        addNewUser.find({ id: query })
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