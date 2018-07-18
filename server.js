var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

let messages = [];
let nickNames = [];

app.get('/', function(req, res){
	res.sendFile(__dirname + '/index.html');
});

app.get('/script.js', function(req, res){
	res.sendFile(__dirname + 'script.js');
});

io.on('connection', function(socket) {
	console.log('Client connected');

	socket.on('chat users', function(msg) {
		if(checkNickname(msg)) {
			nickNames.push(msg);
			io.emit('chat users', nickNames);
		} else {
			socket.emit('exception', {errorMessage: "Nickname is invalid! Please try again later."});
		}
	});
	
	socket.on('chat message', function(msg) {
		messages.push(msg);
		io.emit('chat message', messages);
	});
});

function checkNickname(msg) {
	let isValid = true;
	nickNames.forEach(el=>{
		if(Object.is(msg.nickName, el.nickName)) {
			isValid = false;
		}
	});
	return isValid;
}

http.listen(5000, function(){
	console.log('listening on *:5000');
});