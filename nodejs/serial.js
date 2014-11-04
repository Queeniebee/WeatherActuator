'use strict';

var tty = require('serialport');

var serialPort = new tty.SerialPort("/dev/tty.usbmodemfd121", {
	baudrate: 9600,
	parser: tty.parsers.readline('\r\n')
});

serialPort.on('open',function() {
	console.log('Port open');
});

serialPort.on('data', function(data) {
	console.log(data);
});