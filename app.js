var express = require('express');
const moment = require('moment');
var path = require('path');
var cookieParser = require('cookie-parser');
const cron = require("node-cron");
var ip = require("ip");
const passport=require('passport')
const passportConfig = require('./modules/passport')

var _logger= require("./modules/winston");

var indexRouter = require('./routes/index');
var notionRouter= require('./routes/notion')
var asanaRouter=require('./routes/asana');




var app = express();
var port =15011;


app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(session({secret: 'secret'})); // session 방식 구현시 필요
app.use(passport.initialize());
//app.use(passport.session()); // session 방식 구현 시 필요
// passportConfig();

app.use('/', indexRouter);
app.use('/notion', notionRouter);
app.use('/asana', asanaRouter);



var server = app.listen(port, function(){
    _logger.info(`Start SyncAPI Server ${ip.address()}:${port} at ${moment().format('YYYY-MM-DD HH:mm:ss')}`)
    process.emit("startListup");
    process.emit("startWR");
    process.emit("startSync");
    process.emit("startSyncAsana");
})

