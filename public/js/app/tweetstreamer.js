

var map, heatmap;
var pointArray = new Array();


function initialize() {
    //var myLatlng = new google.maps.LatLng(-25.363882,131.044922);
    var mapOptions = {
      center: new google.maps.LatLng(18.45, -66.1),
      zoom: 3,
      mapTypeId: google.maps.MapTypeId.SATELLITE
    };
    


    map = new google.maps.Map(document.getElementById('map-canvas'),mapOptions); 
    // heatmap layer
      //pointArray.push(new google.maps.LatLng(40.7127, -74.0050));
      heatmap = new google.maps.visualization.HeatmapLayer({
       data: pointArray,
       map: map,
       radius: 10
      });
      heatmap.setMap(map);
};

$(document).ready(function() {
//var socket = io.connect('http://54.86.73.235:3000');
var socket = io.connect();

socket.on('cachedLocs', function(cached) {
    var x = 0;
    while (x < cached.length){
        var loc = new google.maps.LatLng(cached[x][0],cached[x][1]);
        //console.log(cached[x]);
        pointArray.push(loc);
        x += 1;
    }
    heatmap.setMap(map);
})

socket.on('tweet', function (tweet) {
    var tweetLatLon = new google.maps.LatLng(tweet.lat, tweet.lon);     
    pointArray.push(tweetLatLon);
    heatmap.setMap(map);

    
    
    google.maps.event.addListener(marker, 'click', function() {
            infowindow.open(map,marker);
    });
    
    $('#positive').html(Math.round((tweet.positive / 255) * 100) + ' % ');             
    $('#negative').html(Math.round((tweet.negative / 255) * 100) + ' % ');             
    $('#tweetcount').html(tweet.count);             
    $('#failed-lookups').html(tweet.failedLookUps);             
    
    emotion = 'rgb(' + tweet.negative + ', ' + tweet.positive + ', ' + '0)'; 
    console.log('emotion is ' + emotion);
     
    $('#page-body').css({'background-color': emotion});

});
    google.maps.event.addDomListener(window, 'load', initialize);
});    
        
