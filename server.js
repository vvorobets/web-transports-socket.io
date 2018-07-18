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
			nickNames[id].id = id;
			nickNames[id].socketId = socket.id;
console.log(socket.id);
console.log(nickNames[id]);
			// sending existing messages to the new user
			socket.emit('chat message', messages);
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
		let notation = `@${msg.nickName} is typing …`;
		io.emit('chat oninput', notation);
		
		if(Object.is('@', msg.text[0])) {
			nickNames.forEach(user=>{

				let test = msg.text.slice(1, user.nickName.length + 1);
				if(Object.is(test, user.nickName)) {
					socket.broadcast.to(user.socketId).emit('chat direct', msg);
					return;
				}
			});
		}
	});
	
	socket.on('chat message', function(msg) {
		messages.push(msg);
		io.emit('chat message', messages);
	});

	socket.on('disconnect', function(msg){
		if(id>=0){
			nickNames[id].userState = 'just left';
			io.sockets.emit('chat users', nickNames);
		
			setInterval(function(){
				nickNames[id].userState = 'offline';
				io.sockets.emit('chat users', nickNames);
			}, 60000);
		}
	});
});

http.listen(5000, function(){
	console.log('listening on *:5000');
});