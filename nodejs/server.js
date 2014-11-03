/*Server for Weather Actuator
* by Seiyable && Queeniebee
*
* RESTful version
*/

"use strict";
var express = require('express');
var exphbs  = require('express3-handlebars');
var bodyParser = require('body-parser');
var firmata = require('firmata');

var ledPin = 13;
var tempValue = 0;
var cityname = "";
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
var server = app.listen(3000, function(){
  console.log('Listening on port %d', server.address().port);
});

//serve up index page from views/layouts
//WORKS
function sendIndexPage(req, res){
	res.render('layouts/top');
}

//function that sets the city for the Actuator
//FAILS
function getCity(req, res){

	res.write(/*where I write "<cityName> is set"*/);
}
//function that gets the temp of the specified city
//FAILS
function getCityTemp(err, req, res, next){

//     if (!err && res.statusCode === 200) {
    if (!err) {
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
        var data = JSON.parse(res);
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
	res.render('layouts/city');
//   request.get(query, getCityTemp);
}
}

app.get('/', sendIndexPage);
//this GETs the city and sets it on the physical device
  //need to figure out if this app.get can accept a string with an array variable
app.post('cityname/NewYork/', getCity);
app.post('cityname/London/', getCity);
app.post('cityname/Toyko/', getCity);

//this GETs the actual temp from the OpenWeather API
app.get('/ask', getCityTemp);