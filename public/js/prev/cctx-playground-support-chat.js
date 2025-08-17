const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
let leaveRoomConfirmed = false;
// Get username and room from URL
const {username,room} = Qs.parse(location.search,{ignoreQueryPrefix:true});
console.log({username,room});

const socket = io({closeOnBeforeunload:false});
window.onbeforeunload = function(ev){
  leaveRoomConfirmed = true;
  socket.emit("cctx_pg_user_disconnected");
};
// Join chatroom
socket.emit("cctx_pg_user_connected",{username,room,isLeaving:leaveRoomConfirmed});
// Get room and users
socket.on("cctx_pg_reload_room",({room,users}) => {
  outputRoomName(room);
  outputUsers(users);
});
// Message from server
socket.on("cctx_pg_message",msg => {
  console.log(msg);
  outputMessage(msg);
  chatMessages.scrollTop = chatMessages.scrollHeight;
});
// Message submit
chatForm.addEventListener("submit",ev => {
  ev.preventDefault();
  let msg = ev.target.elements.msg.value;
  msg = msg.trim();
  if(!msg) return false;
  socket.emit("cctx_pg_chat_message",msg);
  ev.target.elements.msg.value = "";
  ev.target.elements.msg.focus();
});
// Output message to DOM
function outputMessage(msg){
  const div = document.createElement("div");
  div.classList.add("message");
  const msgMeta = document.createElement("p");
  msgMeta.classList.add("meta");
  msgMeta.innerText = msg.username;
  msgMeta.innerHTML += `<span>${msg.time}</span>`;
  div.appendChild(msgMeta);
  const msgText = document.createElement("p");
  msgText.classList.add("text");
  msgText.innerText = msg.text;
  div.appendChild(msgText);
  document.querySelector(".chat-messages").appendChild(div);
}
// Add room name to DOM
function outputRoomName(room){roomName.innerText = room;}
// Add users to DOM
function outputUsers(users){
  console.log({users})
  userList.innerHTML = "";
  users.forEach(user => {
    const userListItem = document.createElement("li");
    userListItem.innerText = user.username;
    userList.appendChild(userListItem);
  });
}
//Prompt the user before leave chat room
document.getElementById("leave-btn").addEventListener("click",() => {
  const leaveRoom = confirm("Are you sure you want to leave the chat?");
  if(leaveRoom) window.location = "../cctx-playground-support.html";
});