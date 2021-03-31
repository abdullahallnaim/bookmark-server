const express = require('express')
const app = express()
const port = 5000
const MongoClient = require('mongodb').MongoClient;
const bodyParser = require('body-parser');
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
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

    // add newuser
    app.post("/users", (req, res) => {
        console.log(req.body.nofile == true)
        if (req.body.type == 'gf') {
            addNewUser.insertOne(req.body)
                .then(result => {
                    res.send(result.insertedCount > 0);
                })
        }
        else if (req.body.type == 'withmail') {
            let fname = req.body.fname
            let lname = req.body.lname
            let email = req.body.email
            let id = req.body.id
            let password = req.body.password

            if (req.body.nofile) {
                let userInfo = {
                    name: fname + ' ' + lname,
                    email: email,
                    password: password,
                    id: id
                }

                addNewUser.insertOne(userInfo)
                    .then(result => {
                        res.send(result.insertedCount > 0);
                        console.log('user added successfully with email without photo')
                    })


            } else {
                const imgFile = req.files.file;
                const addImg = imgFile.data;
                const encImage = addImg.toString('base64');
                var photo = {
                    contentType: imgFile.mimetype,
                    size: imgFile.size,
                    image: Buffer.from(encImage, 'base64')
                };
                let userInf = {
                    name: fname + ' ' + lname,
                    email: email,
                    password: password,
                    photo: photo,
                    id: id
                }

                addNewUser.insertOne(userInf)
                    .then(result => {
                        res.send(result.insertedCount > 0);
                        console.log('user added successfully with email with photo')
                    })
            }

        }

    })
    //update email & password
    app.put("/user", (req, res) => {

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

    app.post("/bookmark", (req, res) => {
        const bookmark = req.body;
        const catArr = req.body.category;
        if (Array.isArray(catArr)) {
            let addCat
            for (let i = 0; i < catArr.length; i++) {
                addCat = [{
                    category: catArr[i],
                    email: req.body.email,
                    sitename: req.body.sitename,
                    sitelink: req.body.sitelink
                }]
                console.log(addCat)
                addBookmark.insertMany(addCat)
                    .then(result => {
                        // res.send(result.insertedCount > 0);
                    })

            }
        } else {
            addBookmark.insertOne(bookmark)
                .then(result => {
                    res.send(result.insertedCount > 0);
                })
        }
    })
    app.put('/editcategory', (req, res) => {
        console.log(req.body)
        addBookmark.updateMany({ email: req.body.email, category: req.body.oldcat, sitename: req.body.oldname }, { $set: { category: req.body.newcategory, sitename: req.body.sitename, sitelink: req.body.sitelink } }, (err, result) => {
            if (err) {
                console.log('failed')
            } else {
                console.log('changed')
            }
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
    
    app.get('/data', (req, res) => {
        addNewUser.find({})
            .toArray((err, documents) => {
                console.log(documents)
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
    app.get('/bookmarksinfo', (req, res) => {
        console.log(req.query.category)
        console.log(req.query.sitename)
        addBookmark.find({ category: req.query.category, sitename: req.query.sitename })
            .toArray((err, documents) => {
                res.send(documents)
            })
    })
    app.delete('/deletebookmark', (req, res) => {
        console.log(req.query.category)
        console.log(req.query.sitename)
        addBookmark.deleteOne({ email: req.query.email, category: req.query.category, sitename: req.query.sitename }, (err) => {
            if (err) {
                console.log('not deleted')
            } else {
                console.log('deleted')
            }
        })
    })
});

app.listen(process.env.PORT || port)