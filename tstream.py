import tweepy
import json
from pymongo import MongoClient
#from bson import json_util
from tweepy.utils import import_simplejson


#json = import_simplejson()
mongocon = MongoClient('localhost', 27017)

db = mongocon.tstream
col = db.tweets_tail

consumer_key = 'GVHW3R5GdJqJX81Fgyox533l9'
consumer_secret = '7w34DHsT8Oz5pXwvGrRbCLRjafmvcakQ0Yy8Py42nVZDQeM6yg'

access_token_key = '16475635-Fc22xRFTmeuzQoYj4f5AVtD9zcmGZvZSij3be8H8F'
access_token_secret = 'xQJDRk4pHFDmuOcwIR3NprwS9ASH7ZQ7qmwptbiPy93Em'

auth1 = tweepy.OAuthHandler(consumer_key, consumer_secret)
auth1.set_access_token(access_token_key, access_token_secret)

class StreamListener(tweepy.StreamListener):
    mongocon = MongoClient('localhost', 27017)
    db = mongocon.tstream
    col = db.tweets_tail
    #json = import_simplejson()

    
    def on_status(self, tweet):
        print 'Ran on_status'

    def on_error(self, status_code):
        return False

    def on_data(self, data):
        all_data = json.loads(data)
        try:
            coord = all_data['coordinates']
            place = all_data['place']
        except:
            print 'no coordinate info'

        try:
            if coord and place:
                col.insert(all_data)
                print "Inserted new row, # %d" % col.count()
        except:
            pass
        return True

        # if data[0].isdigit():
        #     pass
        # else:
        #     col.insert(json.loads(data))
        #     print(json.loads(data))


l = StreamListener()
streamer = tweepy.Stream(auth=auth1, listener=l)
#setTerms = ['bigdata', 'devops', 'hadoop', 'twitter']
#streamer.filter(track = setTerms)
streamer.sample()
