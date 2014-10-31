/*Server for Weather Actuator
* by Seiyable && Queeniebee
*
*/
//================================================
"use strict";

//require
var express = require('express');
var exphbs  = require('express3-handlebars');
var fs = require('fs');

var bodyParser = require('body-parser');
var request = require('request');

var SerialPort = require("serialport");
var SerialPort = require("serialport").SerialPort;

var app = express();
var port = "/dev/tty.usbmodemfd121";
var baudrate = 9600;
var active = false;

var serialPort = new SerialPort(port, {
	baudrate: baudrate
});

function attemptLogging(fd, port, baudrate){
if (!active) {
			fs.stat(port,  function (err, stats) {
			  if (!err) {
				active = true;
		
				fs.write(fd, "\n----\nOpening SerialPort: "+target+" at "+Date.now()+"\n----\n");  
				serialPort.on("data", function (data) {
				  fs.write(fd, data.toString());
				});
				serialPort.on("close", function (data) {
				  active = false;
				  fs.write(fd, "\n----\nClosing SerialPort: "+target+" at "+Date.now()+"\n----\n");  
				});
			  }
			});
		  }
		}

		if (!port) {
		  console.log("You must specify a serial port location.");
		} else {
		  var target = port.split("/");
		  target = target[target.length-1]+".log";
		  if (!baudrate) {
			baudrate = 9600;
		  }
		  fs.open("./"+target, 'w', function (err, fd) {
			setInterval(function () {
			  if (!active) {
				try {
				  attemptLogging(fd, port, baudrate);  
				} catch (e) {
				  // Error means port is not available for listening.
				  active = false;
				}
			  }
			}, 1000);
		  });
}
/*
var serialPort = new SerialPort("/dev/tty.usbmodemfd121", {
        baudrate: 9600,
        // defaults for Arduino serial communication
         dataBits: 8,
         parity: 'none',
         stopBits: 1,
         flowControl: false
}); */

//use static local files
app.use(express.static(__dirname + '/public'));
//handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
//body parser
app.use(bodyParser());

//================================================

/***********************************
A routing function that
1)receives a GET request, and
2)returns a html to web client
***********************************/
app.get('/', function(req, res){
  res.render('layouts/top');
});

/***********************************
A routing function that
1)receives a POST request with a city name,
2)accesses to Open Weather API, and
2)returns a html to web client
***********************************/
app.post('/', function(req, res){
  //assign the receiveed city name to a new variable
  cityname = req.body.cityname;

  //initialize variables for the access to Open Weather API
  var query = "http://api.openweathermap.org/data/2.5/weather?";
  var options = [];
  options["APPID"] = "d9a5fc0bed270bb5e6e3c6ae3d0b2fe7";
  options["q"] = cityname;

  //make a query string with these variables
  for (key in options){
    var str = key + '=' + options[key];
    query = query + str + '&';
  }
  //remove the last charactor '&' from the query
  query = query.slice(0, -1);
  //console.log("Query: " + query);

  //a callback function that will be called after the access to the API
  var callback = function(error, response, body) {
    if (!error && response.statusCode === 200) {
        var data = JSON.parse(body);
        console.log("Response from API:");
        //console.log(data);
		
        //convert the temperature from Kelvin to Celcius
        data.main.temp = data.main.temp - 273.15;
        data.main.temp = data.main.temp.toFixed(1);
        console.log(data.main.temp);

		//Printing to serial port 
		/*function attemptLogging(fd, port, baudrate) {
		  if (!active) {
			fs.stat(port,  function (err, stats) {
			  if (!err) {
				active = true;
		
				fs.write(fd, "\n----\nOpening SerialPort: "+target+" at "+Date.now()+"\n----\n");  
				serialPort.on("data", function (data) {
				  fs.write(fd, data.toString());
				});
				serialPort.on("close", function (data) {
				  active = false;
				  fs.write(fd, "\n----\nClosing SerialPort: "+target+" at "+Date.now()+"\n----\n");  
				});
			  }
			});
		  }
		}

		if (!port) {
		  console.log("You must specify a serial port location.");
		} else {
		  var target = port.split("/");
		  target = target[target.length-1]+".log";
		  if (!baudrate) {
			baudrate = 9600;
		  }
		  fs.open("./"+target, 'w', function (err, fd) {
			setInterval(function () {
			  if (!active) {
				try {
				  attemptLogging(fd, port, baudrate);  
				} catch (e) {
				  // Error means port is not available for listening.
				  active = false;
				}
			  }
			}, 1000);
		  });
		} */


		//need to convert to an int!
		var dataToSend = parseInt(data.main.temp);
		serialPort.write(dataToSend);

        //render a html with the response
        res.render('layouts/top', data);
    }
  };
  //request to the API
  request.get(query, callback);
});

//============================================
//server setup
var server = app.listen(3000, function(){
  console.log('Listening on port %d', server.address().port);
}); 
