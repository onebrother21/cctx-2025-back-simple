const doSockets = () => {
  var socket = io();

  const form = document.getElementById('chat-form');
  const input = document.getElementById('chat-input');

  if(form) form.addEventListener('submit', function(e) {
    e.preventDefault();
    if (input.value) {
      socket.emit('chat message', input.value);
      input.value = '';
    }
  });
  socket.on('chat message', function(msg) {
    const item = document.createElement('li');
    item.textContent = msg;
    messages.appendChild(item);
    window.scrollTo(0, document.body.scrollHeight);
  });
  console.log(JSON.parse(parsed_data));
};
document.addEventListener('DOMContentLoaded', () => {
  doSockets();
});