/*Server for Weather Actuator
* by Seiyable && Queeniebee
*
* RESTful version
*/

"use strict";

//require
var express = require('express');
var exphbs  = require('express3-handlebars');
var fs = require('fs');

var bodyParser = require('body-parser');
var request = require('request');
var firmata = require('firmata');
var ledPin = 13;
var port = "/dev/tty.usbmodemfd121";
var board = new firmata.Board(port, function(err){
    if (err) {
        console.log(err);
        return;
    }
    console.log('connected');
	board.pinMode(ledPin, board.MODES.OUTPUT);

});

var app = express();
var cityname = "";
var tempValue = 0;

//use static local files
app.use(express.static(__dirname + '/public'));
//handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
//body parser
app.use(bodyParser());

//server setup
var server = app.listen(3000, function(){
  console.log('Listening on port %d', server.address().port);
});
/***********************************
A routing function that
1)receives a GET request, and
2)returns a html to web client
***********************************/
// app.get('/', function(req, res){
//   response.render('layouts/top');
// });

/*  API - RESTful Stuff */

function sendIndexPage(req, res){
	response.render('layouts/top');
}

function getCity(req, res){
	cityname = req.params[1];
	var query = "http://api.openweathermap.org/data/2.5/weather?";
  	var key = "";
  	var options = [];
  	options["APPID"] = "d9a5fc0bed270bb5e6e3c6ae3d0b2fe7";
  	options["q"] = cityname;

	for (key in options){
		var str = key + '=' + options[key];
		query = query + str + '&';
	}
	  //remove the last character '&' from the query
	  query = query.slice(0, -1);

}

function getCityTemp(error, response, body) {
    if (!error && response.statusCode === 200) {
        var data = JSON.parse(body);
        console.log("Response from API:");
        //console.log(data);
		
        //convert the temperature from Kelvin to Celsius
        data.main.temp = data.main.temp - 273.15;
        data.main.temp = data.main.temp.toFixed(1);
        console.log(data.main.temp);

		tempValue = data.main.temp;

		if(tempValue >= 10){

			board.digitalWrite(ledPin, board.HIGH);

		} else{
		board.digitalWrite(ledPin, board.LOW);

		}
  request.get(query, callback);

}

app.get('/', sendIndexPage);
//this GETs the city and sets it on the physical device
  //need to figure out if this app.get can accept a string with an array variable
app.get('cityname/NewYork/', getCity);
app.get('cityname/London/', getCity);
app.get('cityname/Toyko/', getCity);

//this GETs the actual temp from the OpenWeather API
app.get('/ask', getCityTemp);

/***********************************
A routing function that
1)receives a POST request with a city name,
2)accesses to Open Weather API, and
2)returns a html to web client
***********************************/

/*
app.post('/', function(req, res){
  //assign the received city name to a new variable
	cityname = req.body.cityname;
  
  //initialize variables for the access to Open Weather API
  var query = "http://api.openweathermap.org/data/2.5/weather?";
  var key = "";
  var options = [];
  options["APPID"] = "d9a5fc0bed270bb5e6e3c6ae3d0b2fe7";
  options["q"] = cityname;

  //make a query string with these variables
  for (key in options){
    var str = key + '=' + options[key];
    query = query + str + '&';
  }

  //remove the last character '&' from the query
  query = query.slice(0, -1);
  //console.log("Query: " + query);

  //a callback function that will be called after the access to the API
  var callback = function(error, response, body) {
    if (!error && response.statusCode === 200) {
        var data = JSON.parse(body);
        console.log("Response from API:");
        //console.log(data);
		
        //convert the temperature from Kelvin to Celsius
        data.main.temp = data.main.temp - 273.15;
        data.main.temp = data.main.temp.toFixed(1);
        console.log(data.main.temp);

		tempValue = data.main.temp;

		if(tempValue >= 10){

			board.digitalWrite(ledPin, board.HIGH);

		} else{
		board.digitalWrite(ledPin, board.LOW);

		}
	
// 		})

        //render a html with the response
        res.render('layouts/top', data);
    }
  };
  //request to the API
  request.get(query, callback);
});
*/