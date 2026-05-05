export class GlassAppSockets {
  msgs = [];
  user = null;
  socket;
  options  = {
    timeout: 30000,
    path:"/glass/socket.io",
    autoConnect:false,
    withCredentials:true,
    transports: ["websocket","polling"],
    auth:cb => cb({token:glassState.get("authTkn")}),
    // query:{x:57,y:38}
  };
  constructor(){
    this.socket = io(`/admn-ctrl`,this.options);
  }
  async init(user){
    this.socket.on('disconnect', (reason) => this.receiveMessage({
      //id:this.socket.id || "",
      type:'disconnect',
      data:{reason},
      ts:Date.now()
    }));
    this.socket.on('reconnect', (attempt) => this.receiveMessage({
      //id:this.socket.id || "",
      type:'reconnect',
      data:{attempt},
      ts:Date.now()
    }));
    this.socket.on('error',e => this.receiveMessage({
      //id:this.socket.id || "",
      type:'error',
      data:{err:e},
      ts:Date.now()
    }));
    this.socket.on('server_to_client',m => this.receiveMessage(JSON.parse(m)));
    this.user = user;

    await this.connect();
    this.sendMessage({type:"register",data:{deviceId:null}});
  }
  async connect(){
    await new Promise((done,reject) => {
      this.socket.on("connect", () => {
        console.log("Connected with ID:",this.socket.id);
        done();
      });
      this.socket.on("connect_error", (error) => {
        console.error("Connection Error: ",error);
        reject(error);
      });
      this.socket.connect();
    });
  }
  receiveMessage(o){this.msgs.push(o);}
  sendMessage(o) {
    if(this.user && this.socket.connected){
      const msg = {
        id:this.socket.id,
        user:this.user,
        ts:Date.now(),
        ...o
      };
      this.socket.emit('client_to_server',JSON.stringify(msg));
    }
    else console.warn("socket not connected",this.user);
  }
  getLastMessage(){
    const msgCt = this.msgs.length;
    const msg = this.msgs[this.msgs.length - 1];
    return {msg,msgCt};
  }
  initChat(){
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
    socket.on('chat message', function(msg) {
      const item = document.createElement('li');
      item.textContent = msg;
      messages.appendChild(item);
      window.scrollTo(0, document.body.scrollHeight);
    });
    console.log(JSON.parse(parsed_data));
  }
}