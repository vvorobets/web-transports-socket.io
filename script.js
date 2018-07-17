(function(){
	var userHeader = document.getElementById('userHeader');
	var nameButton = document.getElementById('nameButton');
	var nameInput = document.getElementById('nameInput');
	var messages = document.getElementById('messages');
	var text = document.getElementById('text');
	var textSubmit = document.getElementById('textSubmit');

	var userName = 'User Name';
	userHeader.innerText = userName;

	var socket = io.connect();

	nameButton.onclick = function() {
		userName = nameInput.value || 'User Name';
		userHeader.innerText = userName;
	};

	textSubmit.onclick = function() {
		var data = {
			name: userName,
			text: text.value
		};
		text.value = '';

		socket.emit('chat message', data);
	};

	socket.on('chat history', function(msg) {
		messages.innerHTML = '';
		for(var i in msg) {
			if(msg.hasOwnProperty(i)) {
				var el = document.createElement('li');
				el.innerText = msg[i].name + ': ' + msg[i].text;
				messages.appendChild(el);
			}
		}
	});

	socket.on('chat message', function(msg) {
		var el = document.createElement('li');
		el.innerText = msg.name + ': ' + msg.text;
		messages.appendChild(el);
	});
})();