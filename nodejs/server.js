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
var serialport = require('serialport');

var SerialPort = serialport.SerialPort;

var myPort = new SerialPort("/dev/tty.usbmodemfd121", {
	baudrate: 9600,
	parser: serialport.parsers.readline('\r\n')
});

var ledPin = 13;
var tempValue = 0;

var app = express();
//use static local files
app.use(express.static(__dirname + '/public'));
//handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
//body parser
// app.use(bodyParser());
app.use(bodyParser.urlencoded())
//server setup
var server = app.listen(3300, function(){
  console.log('Listening on port %d', server.address().port);
});

//serve up index page from views/layouts
function sendIndexPage(req, res){
	res.render('layouts/top');
}
function getDeviceName(req, res){
	var actuatorName = req.param('device');
	console.log(actuatorName);
	app.locals.actuator = actuatorName;

	res.render('layouts/city', {actuator: actuatorName});

}
//DOESN'T WORK
function setDeviceName(req, res){
	var actuatorName = req.body.Actuator;
	console.log(actuatorName);
	app.locals.actuator = actuatorName;

	res.render('layouts/actuatorName');

}

//function that sets the city for the Actuator
//WORKS
function getCity(req, res, body){
	var actuatorName = req.param('device');
	app.locals.actuator = actuatorName;
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

		tempValue = map_range(tempValue, -10, 30, 0, 359);
        tempValue = Math.round(tempValue);
        if(tempValue > 359) {tempValue = 359;}
        if(tempValue < 0) {tempValue = 0;}
        tempValue = tempValue.toString();
        console.log(tempValue);
        // send it out the serial port:
        myPort.write(tempValue);


		res.render('layouts/city', data);
		}
	}

		request.get(query, callback);
} 

function map_range(value, low1, high1, low2, high2) {
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

app.get('/', sendIndexPage);
app.get('/device/:device', getDeviceName);
app.post('/device', setDeviceName);
app.post('/device/cityname/', getCity);

app.get('/device/:device/:cityname', getCity);

