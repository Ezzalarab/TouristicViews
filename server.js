const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')
const app = express();
require('dotenv').config()
const multer = require('multer')

const FormData = require('form-data');
const form = new FormData();

// to can get to our application public

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


app.use('/user', userRouter);
app.use('/admin', adminRouter)


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
        cb(null, 'images')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + '.png')
    }
});

var storageCategoryImage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'categoryImages')
    },
    filename: (req, file, cb) => {
        cb(null, 'cate' + Date.now() + '.png')
    }
})

var upload = multer({ storage: storage });
var uploadCategoryImage = multer({ storage: storageCategoryImage })

app.post('/user/upload', upload.single('image'), (req, res, next) => {

    const { username, categoryID, title, description } = req.body
    var obj = {
        username,
        categoryID,
        title,
        description,
        image: '/images/' + req.file.filename
    }

    image.create(obj, (err, item) => {
        if (err) {
            res.status(200).json({
                code: -1,
                msg: 'upload Image has been gotten error '
            })
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

app.post('/admin/addCategory', uploadCategoryImage.single('image'), (req, res, next) => {
    const { name } = req.body

    var obj = {
        name,
        image: 'categoryImages/' + req.file.filename
    }
    category.create(obj, (error, item) => {
        if (error) {
            res.status(404).json({
                code: -1,
                msg: 'the error ' + error
            })
        }
        else {
            res.status(200).json({
                code: 1,
                msg: 'category adding has been  successfully done '
            })
        }
    })
})



// start the server 
const server = http.createServer(app)
server.listen(process.env.PORT || 3000, (req, res) => {
    console.log(`the server is running on ${process.env.PORT} ports`)
})