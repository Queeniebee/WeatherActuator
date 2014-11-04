/*Server for Weather Actuator
* by Seiyable && Queeniebee
*
* RESTful version
*/

"use strict";
var express = require('express');
var exphbs  = require('express3-handlebars');
var bodyParser = require('body-parser');
var request = require('request');

var firmata = require('firmata');
var serialPort = require('serialport');

var ledPin = 13;
var tempValue = 0;

var location = "";

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
//use static local files
app.use(express.static(__dirname + '/public'));
//handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
//body parser
app.use(bodyParser());

//server setup
var server = app.listen(3300, function(){
  console.log('Listening on port %d', server.address().port);
});

//serve up index page from views/layouts
function sendIndexPage(req, res){
	res.render('layouts/top');
}

//function that sets the city for the Actuator
//ALMOST WORKS
function getCity(req, res, body){
	var actuatorName = req.param('name');
	var cityName = req.param('cityname');
	var query = "http://api.openweathermap.org/data/2.5/weather?";
  	var key = "";
  	var options = [];
  	options["APPID"] = "d9a5fc0bed270bb5e6e3c6ae3d0b2fe7";
  	options["q"] = cityName; //cityName from above

	for (key in options){
		var str = key + '=' + options[key];
		query = query + str + '&';
	}
	  //remove the last character '&' from the query
	query = query.slice(0, -1);
	//checking if variable is being set
	console.log(cityName);
	console.log(actuatorName);
	
// 	var callback = getCityTemp();

		console.log("Query: " + query);
	//function that gets the temp of the specified city
		var callback = function getCityTemp(error, response, body){
			if(!error && response.statusCode == 200){
         	var data = JSON.parse(body);

        	console.log("Response from API:");
        	console.log(data);

        	//convert the temperature from Kelvin to Celsius
        	data.main.temp = data.main.temp - 273.15;
        	data.main.temp = data.main.temp.toFixed(1);
        	console.log(data.main.temp);

			tempValue = data.main.temp;
			console.log(tempValue);
/*
			if(tempValue >= 10){

				board.digitalWrite(ledPin, board.HIGH);

			} else{
			board.digitalWrite(ledPin, board.LOW);

			}
*/
		res.render('layouts/city', data);
		}
	}

		request.get(query, callback);
// 		res.status(200).send(query);
} 
app.set('name', 'Weather Actuator');
app.get('/', sendIndexPage);
//this GETs the city and sets it on the physical device
app.get('/:name/:cityname/', getCity);
// app.get('/actuator/displaying', getDisplay);

//this GETs the actual temp from the OpenWeather API
// app.get('/ask', getCityTemp);

// '/:name/:cityname'