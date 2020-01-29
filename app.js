const db = require('./models/db');
const cors = require('cors');
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser')
const userController = require('./controllers/userController');
const postController = require('./controllers/postController');

var router = express.Router();
var app = express();
require('events').EventEmitter.prototype._maxListeners = 100;

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));


app.use('/user', userController);
app.use('/post', postController);



app.listen(4000, () => {
    console.log('Express server started at port : 4000');
});
