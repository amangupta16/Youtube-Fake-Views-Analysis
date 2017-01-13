/**
 * Created by macbook_user on 11/2/16.
 */

var express = require('express');
var request = require('request');
var MongoClient = require('mongodb').MongoClient;
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var Logger = require('le_node');
var log = new Logger({
  token:'bdef26b4-f00f-4d41-92f4-f786a95a8d63'
});

var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded(
    {
        extended: true,
        parameterLimit: 52428800
    })
);

var MONGO_URI = "mongodb://kmungale:welcome1@ds029456.mlab.com:29456/youtube_fake_view_analysis";

// Creating user object to store User data
var user = {};

//Connecting to DB using mongoose
mongoose.connect(MONGO_URI);
var db = mongoose.connection;
db.once('open', function() {
  console.log("Connected using mongoose");
});

var userSchema = new mongoose.Schema({
    ip: String,
    userAgent: String,
    referer: String,
    method: String,
    countryName: String,
    regionName: String,
    startTime: String,
    endTime: String,
    startTimeVideo: String,
    endTimeVideo: String,
    canvasFingerPrint: String,
    clickOnBody:[{x: String, y: String, index: false}],
    clickOnVideo: [{x: String, y: String, index: false}],
    keyStrokeOnBody: [String],
    mouseMovementOnBody: [{x: String, y: String, index: false}],
    mouseMovementsOnVideo: [{x: String, y: String, index: false}],
    isAdblockEnabled: Boolean,
    isLoggedIntoFB: Boolean,
    isLoggedIntoGoogle: Boolean,
    isLoggedIntoGooglePlus: Boolean,
    isLoggedIntoTwitter: Boolean,
    timeOut: Boolean
});
userSchema.autoIndex = false;
var userData = mongoose.model('userData', userSchema);


app.set('port', (process.env.PORT || 3001));
app.get('/', function(req, res) {
    var search_ip_by_location = 'http://freegeoip.net/json/' + (req.headers['x-forwarded-for'] || '63.152.57.234');
    var check_ip_reputation =  'http://check.getipintel.net/check.php?ip=' + (req.headers['x-forwarded-for'] || '63.152.57.234') + '&contact=kaustubhmungale@yahoo.com&format=json&oflags=b';
    var location;
    user.userAgent = req.headers['user-agent'];
    user.referer = req.headers['referer'];
    user.method = req.method;
    log.log(req.headers);
    log.log(req.method);
    //console.log(req);
    request(search_ip_by_location, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            log.log(body);
            var parsedData = JSON.parse(response.body);
            user.ip = parsedData['ip'];
            user.countryName = parsedData['country_name'];
            user.regionName  = parsedData['region_name'];
        }
    });

    request(check_ip_reputation, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            var parsedData = JSON.parse(response.body);
            log.log(parsedData);
            //console.log(parsedData);
        }
    });
    res.sendfile("html/index.html")
});

app.post('/userData', function(req, res){
    user.startTime = req.body['startTime'];
    user.endTime = req.body['endTime'];
    user.startTimeVideo = req.body['startTimeVideo'];
    user.endTimeVideo = req.body['endTimeVideo'];
    user.canvasFingerPrint = req.body['canvasFingerPrint'];
    user.clickOnBody = req.body['clickOnBody'];
    user.clickOnVideo = req.body['clickOnVideo'];
    user.keyStrokeOnBody = req.body['keyStrokesOnBody'];
    user.mouseMovementOnBody = req.body['mouseMovementsOnBody'];
    user.mouseMovementsOnVideo = req.body['mouseMovementsOnVideo'];
    user.isAdblockEnabled = req.body['isAdblockEnabled'];
    user.isLoggedIntoFB = req.body['isLoggedIntoFB'];
    user.isLoggedIntoGoogle = req.body['isLoggedIntoGoogle'];
    user.isLoggedIntoGooglePlus = req.body['isLoggedIntoGooglePlus'];
    user.isLoggedIntoTwitter = req.body['isLoggedIntoTwitter'];
    user.timeOut = req.body['timeOut'];
    if(!user.ip) {
        user.ip = req.headers['x-forwarded-for'];
    }
    if(!user.userAgent) {
        user.userAgent = req.headers['user-agent'];
    }

    var modeledData = new userData(user);
    modeledData.save(function (err, modeledData) {
        if(err){
            console.log(err);
        }
    });
    log.log(modeledData);
    res.send({
        "name": "kaustubh"
    });

});

app.get('/css/animate.css', function(req, res) {
    res.sendfile("css/animate.css")
});

app.get('/css/style.css', function(req, res) {
    res.sendfile("css/style.css")
});

app.get('/images/photo_bg.jpg', function(req, res) {
    res.sendfile("images/photo_bg.jpg")
});

app.get('/node_modules/fingerprintjs/fingerprint.js', function(req, res) {
    res.sendfile("node_modules/fingerprintjs/fingerprint.js")
});

app.listen(app.get('port'), function(){
    console.log('Listening on port', app.get('port'));
});
