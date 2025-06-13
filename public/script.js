const socket = io();

function toggleSneak() {
  fetch('/api/sneak').then(res => res.json()).then(data => {
    alert('Sneak: ' + (data.sneak ? 'ON' : 'OFF'));
  });
}

function move(direction) {
  fetch(`/api/move/${direction}`).then(res => res.json()).then(data => {
    alert(`Moved ${data.moved}`);
  });
}

function sendChat() {
  const message = document.getElementById('chatInput').value;
  fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
}

function respawn() {
  fetch('/api/respawn').then(res => res.json()).then(data => {
    alert(data.respawned ? 'Respawned!' : 'Bot not dead');
  });
}

// Live chat feed
socket.on('chat', msg => {
  const box = document.getElementById('chatBox');
  box.innerHTML += `<p>${msg}</p>`;
  box.scrollTop = box.scrollHeight;
});
