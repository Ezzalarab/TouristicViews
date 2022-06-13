const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const app = express();
require('dotenv').config()
const multer = require('multer')

const FormData = require('form-data');
const form = new FormData();

// to can get to our application public

const ngrok = require('ngrok');

var image = require('./models/image')
var user = require('./models/users')
var category = require('./models/category')
const mongoose = require('mongoose')

var fs = require('fs');
var path = require('path');


// the mongodb connection
const connectionString = `mongodb+srv://Tayeb:tayep1998@touristicviews.s2gun.mongodb.net/?retryWrites=true&w=majority`
mongoose.connect(connectionString).
    then(() => console.log('MongoDB connected...')).
    catch(err => console.log(err));



// to make the JSON is the format of transferring data with endpoint 
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())


// to allow browser to send and recieve data from Javascript source
var cors = require('cors');
app.use(cors());





// imports the MVC component 
const userRouter = require('./router/userRouter')
const adminRouter = require('./router/adminRouter')
const userModel = require('./models/users');
const { lookup } = require('dns');
const users = require('./models/users');
const e = require('express');


app.use('/user', userRouter);
app.use('/admin', adminRouter)

app.get('/getFormData', (req, res) => {
    const fs = require('fs')
    fs.readFile('./cacheImage/image-1655046102944.png', (err, data) => {

        res.json(({
            data
        }))
    });

})

app.get('/', (req, res) => {

    user.find({}, (error, data) => {
        if (!error)
            res.status(200).json({
                data
            })
    })

})



// image uploading will be here 
var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'cacheImage')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + '.png')
    }
});

var upload = multer({ storage: storage });


app.post('/upload', upload.single('image'), (req, res, next) => {
    console.log( req.body.userID)
    var obj = {
        // userID: req.body.userID,
        // categoryID: req.body.categoryID,
        image: '/cacheImage/' + req.file.filename
    }

    image.create(obj, (err, item) => {
        if (err) {
            console.log(err);
        }
        else {
            // item.save();
            res.status(200).json({
                code: 1,
                msg: 'Image uploading has been successfully done '
            })
        }
    });

})


app.get('/cursor', (req, res) => {

    let data =[];
    let myPromise = new Promise((correct, erro) => {
        users.find({},(error,data)=>{
            if(!error)
               correct(data)
            else
                erro("error")
        }).cursor().eachAsync((async (doc) => {
            data.push(doc)
        }))
        
    })

    myPromise.then((correct)=>{
        console.log(correct)
    })


    

    
    

    // for  (const doc of image.find({}).cursor()) {
    //     console.log({ doc })
    // }
    function a() {
        res.json("hello")
    }

    a()
})
app.get('/imageByIdCategory', (req, res) => {

    category.aggregate([
        {
            $match: {
                _id: 12
            }
        },
        {
            $lookup: {
                from: "images",
                localField: "_id",
                foreignField: "categoryID",
                as: "info",
                pipeline: [
                    {
                        $lookup: {
                            from: "users",
                            localField: "userID",
                            foreignField: "_id",
                            as: "data"
                        }
                    }
                ]
            }

        },
    ]).exec((err, data) => {
        if (!err) {
            res.status(200).json({
                data
            })
        }

        else {
            res.json({
                error: err
            })
        }
    })
    // qubt77100

    // {
    //     
    // }
})
app.get('/populate', (req, res) => {

    image.aggregate([
        {
            $lookup: {
                from: "users",
                localField: "userID",
                foreignField: "_id",
                as: "info"
            }
        },
        {
            $unwind: '$info'
        }, {
            $project: {
                _id: 1,
                createDate: 1,
                info: {
                    username: 1,
                }
            }
        }
    ]).exec((err, data) => {
        if (!err) {
            res.json({
                data
            })
        }
    })
})
app.get('/getImage', (req, res) => {
    image.find({}, {
        image: 1
    }, (err, item) => {
        if (!err)
            res.status(200).json({
                data: {
                    item
                }
            })
    })
})



// start the server 
const server = http.createServer(app)
server.listen(8080, (req, res) => {


    console.log(`the server is running on ${process.env.PORT} ports`)



})