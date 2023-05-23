const app = require('express')();
const httpServer = require('http').createServer(app);
const io = require('socket.io')(httpServer, {
  cors: {origin : '*'}
});

const users = []

const port = process.env.PORT | 5000

const generateId = () =>{
  let x = Math.random();
  const user = users.find((item) => x === item.userID )
  if(user){
    return generateId()
  }
  return x;
}

io.on('connection', (socket) => {
    console.log('a user connected');

    const id = generateId()
    
    users.push({userID: id, socketID :socket.id})
    
    socket.send({
      type: 0,
      userID: id
    })
  
    socket.on('chat', (message) => {
      console.log(message);
      socket.broadcast.emit('chat',message);
    });

    socket.on('typing',(typing)=>{
      console.log(typing);
      socket.broadcast.emit('typing',typing);
    });
  
    socket.on('disconnect', () => {
      console.log('a user disconnected!');
    });
  });

  httpServer.listen(port,()=>{
    console.log('listening on 5000');
  })
 