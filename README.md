# Twitter_Map
Twitter-Map web application  implemented with Node.js

Twitter-Map
=============

    Plots tweets in real-time on Google maps - using Node.js, socket.io & Google geo-coding service.

    Tweet-plotter subscribes to a particular keyword and shows tweets in real-time. 
    It uses the geo-coding service from Google to lookup the user address before plotting. 

    So the sequence of events are like so: 

    1)  Receives an event from Twitter using the streaming API.
    2)  Looks up the address using Geo-coding api. 
    3)  Send the event over websockets to the browser. 
    4)  Browser plots the tweet on Google maps using the latitude and longitude information looked up already from Google geo coding service.

    
    
    To Run:
    --------
    1) clone
    2) npm install
    3) http://localhost:3000/tweets


Sam Lee (hsl2113), Junchao Lu (jlu4376)
