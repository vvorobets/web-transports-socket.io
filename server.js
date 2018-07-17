var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var messages = [];

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

app.get('/script.js', function(req, res){
	res.sendFile(__dirname + 'script.js');
});

io.on('connection', function(socket) {
	console.log('Client connected');

	socket.on('chat message', function(msg) {
		messages.push(msg);
		io.emit('chat message', msg);
	});

	socket.emit('chat history', messages);
});

http.listen(5000, function(){
	console.log('listening on *:5000');
});