const io = require('socket.io-client');

const socket = io('http://localhost:3000');
const messagesDiv = document.getElementById('chat-messages');

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

socket.on('message', (data) => {
  console.log('Received message: ', data);
  messagesDiv.innerHTML += '<p>' + data + '</p>';
});

function sendMessage() {
  const input = document.getElementById('message-input');
  const message = input.value;
  input.value = '';
  socket.emit('message', message);
}