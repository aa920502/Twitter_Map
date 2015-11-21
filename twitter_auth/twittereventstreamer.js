    
    
    sys = require('util');
    events = require('events');
    
    require('./credentials');

    var twitter = require('ntwitter');

    var MongoClient = require('mongodb').MongoClient;
    var assert = require('assert');
    var mongoURL = 'mongodb://172.31.63.2:27017/tstream';
    

    function TwitterEventStreamer() {
        events.EventEmitter.call(this);
    };

    sys.inherits(TwitterEventStreamer, events.EventEmitter);

    //var dbHandle;

    //MongoClient.connect(mongoURL, function(err, db) {
     // if(!err) {
      //  dbHandle = db;
     // }
    //});
    

    TwitterEventStreamer.prototype.stream = function(keyword) {
        var self = this;
        
        var twitterCredentials = new TwitterCredentials(); 
        var twit = new twitter(twitterCredentials.getSecrets());

        counter = 0;
             
        twit.stream('statuses/filter',{track: keyword}, function(stream) {
                  stream.on('data', function(tweet) {
                    

                    if (tweet.user.location !== null || tweet.geo !== null){
                      // store in mongoDB
                      MongoClient.connect(mongoURL, function(err, db) {
			if (!err) {
                      var collection = db.collection('tweets_tail', function(err, collection) {});
                      collection.insert(tweet);
			}
                      self.emit('tweet', tweet);
                    });
		   }
                  });
		//});
                  
                  stream.on('error', function(error,statusCode) {
                        console.log('Error was this %s', error);
                        console.log('Error was this ' + statusCode);
                        self.emit('error','Error occured on Twitter maybe?');
                  });
            });
    };
    module.exports = TwitterEventStreamer;
    
