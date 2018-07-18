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
	var id = -1;

	socket.on('chat users', function(msg) {
// 		userInfo = Object.assign({}, msg);
// console.log(userInfo);

		function checkNickname(msg) {
			let isValid = true;
			nickNames.forEach(el=>{
				if(Object.is(msg.nickName && msg.nickName, el.nickName)) {
					isValid = false;
				}
			});
			return isValid;
		};

		if(checkNickname(msg)) {
			id = nickNames.length;
			nickNames.push(msg);
			io.emit('chat users', nickNames);
		} else {
			socket.emit('exception', {errorMessage: "Nickname is invalid! Please try again later."});
		}
		setInterval(function(){
			if(id>=0) nickNames[id].userState = 'online';
			io.sockets.emit('chat users', nickNames);
		}, 60000);
	});

	socket.on('chat oninput', function(msg){
		let notation = `@${msg} is typing …`;
		io.emit('chat oninput', notation);
	});
	
	socket.on('chat message', function(msg) {
		messages.push(msg);
		io.emit('chat message', messages);
	});

	socket.on('disconnect', function(msg){
		if(id>=0){
			nickNames[id].userState = 'just left';
			io.sockets.emit('chat users', nickNames);
		}
		setInterval(function(){
			nickNames[id].userState = 'offline';
			io.sockets.emit('chat users', nickNames);
		}, 60000);
	});
});

http.listen(5000, function(){
	console.log('listening on *:5000');
});