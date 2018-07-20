(function(){
	const chatEnter = document.getElementById('chatEnter');
	const uname = document.getElementById('uname');
	const nick = document.getElementById('nick');
	const enterButton = document.getElementById('enterButton');
	const errMessage = document.getElementById('errorMessage');
	const usersList = document.getElementById('usersList');
	const chat = document.getElementById('chat');

	const messages = document.getElementById('messages');
	const text = document.getElementById('text');
	const textSubmit = document.getElementById('textSubmit');
	const notification = document.getElementById('notification');

	let userName = '';
	let nickName = '';

	var socket = io.connect();

	enterButton.addEventListener('click', function(e) {
		e.preventDefault();
		userName = uname.value;
		nickName = nick.value;
		var data = {
			userName: userName,
			nickName: nickName,
			userState: 'just appeared'
		}
		socket.emit('chat users', data);
	});

	textSubmit.addEventListener('click', function(e) {
		e.preventDefault();
		let time = new Date();
		const data = {
			nickName: nickName,
			text: text.value,
			time: time.toUTCString()
		};
		text.value = '';

		socket.emit('chat message', data);
	});

	text.addEventListener('input', function(e) {
		e.preventDefault();
		const data = {
			nickName: nickName,
			text: e.target.value,
		}
		socket.emit('chat oninput', data);
	});

	socket.on('chat users', function(msg) {
		errMessage.innerText = '';
		chatEnter.style.display = "none";
		chat.style.display = "grid";

		usersList.innerHTML = '';
		if(msg.length > 0) {
			for(let i in msg) {
				let el = document.createElement('li');
				el.innerHTML = '<i>' + msg[i].userName + ' </i><b> @' + msg[i].nickName + '</b><br>';
				if(msg[i].userState === 'online') {
					el.innerHTML += '<span class="online">online</span>';
				} else if(msg[i].userState === 'offline') {
					el.innerHTML += '<span class="offline">offline</span>';
				} else if(msg[i].userState === 'just appeared') {
					el.innerHTML += '<span class="appeared">just appeared</span>';
				} else {
					el.innerHTML += '<span class="left">just left</span>';
				}
				usersList.appendChild(el);
			}
		}
	});

	socket.on('exception', function(msg) {
		errMessage.innerText = "Nickname is already used! Please choose another one."; // JSON.parse(msg).error;
	});

	socket.on('chat oninput', function(msg) {
		notification.innerText = msg;
		notification.style.backgroundColor = '#AAAAAA';
	});

	socket.on('chat direct', function(msg) {
		notification.style.backgroundColor = 'orange';
	});

	socket.on('chat message', function(msg) {
		messages.innerHTML = '';
		let side = "left-aligned";
		for(let i in msg) {
			if(msg.hasOwnProperty(i)) {
				var el = document.createElement('li');
				el.setAttribute('class', side);
				side = side === 'left-aligned' ? 'right-aligned' : 'left-aligned';
				el.innerHTML = '<span>' + msg[i].nickName + ' <small><i>' + msg[i].time + '</i></small></span><br><p>' + 
				msg[i].text + '</p>';
				messages.appendChild(el);
			}
		}
		notification.innerText = '';
		notification.style.backgroundColor = '#AAAAAA';
	});
})();