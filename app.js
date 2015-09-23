var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var roomList = {};

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
http.listen(3001, function(){
  console.log('listening on *:3001');
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });

  socket.on('enter', function(data){
    var roomId = data.roomId;
    var roomExist = (roomId in roomList);
    if (!roomExist) {
      roomList[roomId] = [];
    }
    var room = roomList[roomId];
    room.push(socket.id);
    if (roomExist) {
      var otherId = findOther(room, socket.id);
      var otherSocket = io.sockets.connected[otherId];
      otherSocket.emit('start');
    }
  });


  socket.on('exchange', function(data){
    var roomId = data.roomId;
    var room = roomList[roomId];
    var otherId = findOther(room, socket.id);

    var otherSocket = io.sockets.connected[otherId];
    otherSocket.emit('exchange', data);
  });
});

function findOther(room, mySocketId) {
  for (var i in room) {
    var socketId = room[i];
    if (socketId != mySocketId) {
      return socketId;
    }
  }
  return null;
}
