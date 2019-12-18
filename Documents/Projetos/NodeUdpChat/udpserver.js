var dgram   = require('dgram'),
	util    = require('util'),
	port    = 3000,
	clients = [];

function Message(type, message, rinfo) {

	var self     = this;

	this.type    = type;

	this.message = message;

	this.rinfo   = rinfo;

	this.typeConnect = function() {

		var _message = util.format('Nova conexão de %d', this.rinfo.port);
		clients.push(rinfo);
		
		this.brodcast(_message);
		console.log(_message);

	};

	this.typeDisconnect = function() {

		var _message = util.format('Desconexão de %d', this.rinfo.port);
		clients.splice(clients.indexOf(this.rinfo), 1);
		
		this.brodcast(_message);
		console.log(_message);

	};

	this.typeMessage = function() {

		var _message = util.format('%d --> %s', this.rinfo.port, this.message);
		
		this.brodcast(_message);
		console.log(_message);

	};

	this.brodcast = function(message) {

		var	_buffer = new Buffer(message);

		clients.forEach(function(current) {

			if (current.port != self.rinfo.port) {
				server.send(_buffer, 0, _buffer.length, current.port, current.address);
			}

		});

	};

	switch (type) {

		case 'connect':
			this.typeConnect();
		break;

		case 'disconnect':
			this.typeDisconnect();
		break;

		case 'message':
			this.typeMessage();
		break;

		default:
			// nothing
		break;
	}

}

var server = dgram.createSocket('udp4', function(data, rinfo) {
	
	var data    = JSON.parse(data);
		message = new Message(data.type, data.message, rinfo);

	process.stdin.resume();

	process.stdin.removeAllListeners('data');
	process.stdin.on('data', function(chunk) {

	 	var buffer = new Buffer('Servidor => %s', chunk.toString().replace(/\n|\n/g, ''));
	 	
	 	clients.forEach(function(current) {

			server.send(buffer, 0, buffer.length, current.port, current.address);

		});

	});

});

server.bind(port, function() {
	console.log('Servidor iniciado na porta %d.', port);
});