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
	let userInfo;

	socket.on('chat users', function(msg) {
		userInfo = msg;
		if(checkNickname(msg)) {
			nickNames.push(msg);
			io.emit('chat users', nickNames);
		} else {
			socket.emit('exception', {errorMessage: "Nickname is invalid! Please try again later."});
		}
		setInterval(function(){
			let l = nickNames.length;
			nickNames[(l - 1)].userState = 'online';
			io.sockets.emit('chat users', nickNames);
		}, 60000);
	});
	
	socket.on('chat message', function(msg) {
		messages.push(msg);
		io.emit('chat message', messages);
	});

	socket.on('disconnect', function(msg){
		let n = findIndexOfUser(nickNames, userInfo);
		if(n>=0){
			nickNames[n].userState = 'just left';
			io.sockets.emit('chat users', nickNames);
		}
		setInterval(function(){
			nickNames[n].userState = 'offline';
			io.sockets.emit('chat users', nickNames);
		}, 60000);
		
		
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
};
function findIndexOfUser(nickNames, userInfo){
	for(let i = 0, l = nickNames.length; i < l; i++) {
		if(Object.is(nickNames[i].nickName, userInfo.nickName) === true) {
			return i;
		}
	};
	return -1;
};

http.listen(5000, function(){
	console.log('listening on *:5000');
});