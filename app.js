  
/**    
 * Module dependencies.
 */

  var express = require('express');
  var app = express();
  var server = require('http').createServer(app);
  var io = require('socket.io').listen(server);
  var stylus = require('stylus');
  var sentiment = require('sentiment');  
  var GoogleMapsAPI = require('googlemaps');
  var MongoClient = require('mongodb').MongoClient;
  var assert = require('assert');



  //var term = prompt('Enter Twitter keyword to search');
  var searchTerm = 'usa'
  //helper
  function isEmpty(obj) {
    return !Object.keys(obj).length > 0;
  };

  function queryDB(keyword) {
  var mongoURL = 'mongodb://172.31.63.2:27017/tstream';
  var cachedLocs = new Array();
  MongoClient.connect(mongoURL, function(err, db) {
    assert.equal(null, err);
    var collection = db.collection('tweets_tail');
    console.log(keyword);
    var mongoSearch = new RegExp(keyword);
    console.log(mongoSearch);
    collection.find({text:mongoSearch},{"geo.coordinates":1, "_id": 0}).toArray(function(err, docs) {
      console.log("retrieved records: ");
      var x = 0;
      console.log(docs.length);
      while (x < docs.length){
        if (!isEmpty(docs[x])) {
          console.log(docs[x].geo.coordinates[0], docs[x].geo.coordinates[1]);
          cachedLocs.push([docs[x].geo.coordinates[0], docs[x].geo.coordinates[1]]);
        };
        x += 1;
      };
    });
  });
	return cachedLocs;
};


  // googlemaps api
  var publicConfig = {
    //key: 'AIzaSyBZ2by2UxFAQEYrHHbWcxOH-zZTsI0PEs4'
    key: 'AIzaSyDVJYpMGDKiZ_ZO--PkvmHIijLNHdq0msM'
  };
  var gmAPI = new GoogleMapsAPI(publicConfig);

  server.listen(8081);

  // Self implemented module
  var TwitterEventStreamer = require('./twitter_auth/twittereventstreamer');
 


  // A multi-transport async logging library
  var winston = require('winston');
  var logger = new (winston.Logger)({
      transports: [new (winston.transports.Console)({})]
  });

  var tes = new TwitterEventStreamer();
 
 
  // set tweet stream search term
  tes.stream(searchTerm);
  var tweetcounter = 0;


  /* Stylus compile */
  function compile(str, path) {
     return stylus(str)
    .set('filename', path)
    .use(nib())
  };
  
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({secret: 'sea-animal'}));
  app.use(express.static(__dirname + '/public'));
  app.use(stylus.middleware(
    { src: __dirname + '/public'
      , compile: compile
    }
  ));


  app.set('views', __dirname + '/views')
  app.set('view engine', 'jade')

  app.get('/tweets', function(req , res){
	  var user = req.session.user || {};
	  res.render('tweets', {title: 'Tweets'});
  }); 
var cached = new Array();
cached = queryDB('usa');
 //console.log(searchTerm);
 
  var websocket = null;
  io.sockets.on('connection', function (socket) {
        websocket = socket;
        socket.emit('cachedLocs', cached);
	console.log('sent cached');
        socket.on('text',function (data){
          console.log('received data ==  ' + data);
          var d = data.toString();
          cached = new Array();
          cached = queryDB(d);
          tes.stream(d);
          socket.emit('cachedLocs', cached);
        });
  });
  
  
  var failedLookUps = 0;
  
  var positive = 0;
  var negative = 0;

//io.sockets.on('selection', function)


tes.on('tweet', function(tweet) {
++tweetcounter;

  if (typeof tweet === 'object' && tweet !== null){
    if(tweet.user.location !== null){
      //console.log('tweet', tweet.user.location);
      var geocodeParams = {'address': tweet.user.location };
      gmAPI.geocode(geocodeParams, function(err, result){
        if(typeof result !== 'undefined' ){
          //console.log(result.results[0].geometry.location.lat, result.results[0].geometry.location.lng);
          if(websocket !== null) {
            websocket.emit('tweet', { user : tweet.user.name , text: tweet.text, lat: result.results[0].geometry.location.lat,
                lon: result.results[0].geometry.location.lng, 
                profileImage : tweet.user.profile_image_url,
                count : tweetcounter, 
                failedLookUps: failedLookUps,
                //positive: score.positive,
                //negative: score.negative
              });
            }
          };
      });
    }
  }
  
  lsscore = calculateRG(positive, negative);
    
  if(tweet.geo !== null) {
    if(websocket !== null) {
      websocket.emit('tweet', { user : tweet.user.name , text: tweet.text, lat: tweet.geo.coordinates[0],//geodata.lat ,
          lon: tweet.geo.coordinates[1], 
          profileImage : tweet.user.profile_image_url,
          count : tweetcounter, 
          failedLookUps: failedLookUps,
          //positive: score.positive,
          //negative: score.negative
        });

    }
  }   

});
  
           
  function calculateRG(positive, negative) {
    var total  = positive + negative;
    var green = Math.round( (positive / total) * 255 );
    var red = Math.round( (negative / total ) * 255 );
    return {
        'positive' : green,
        'negative' : red
    }
  }
