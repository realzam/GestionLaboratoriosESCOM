const express = require('express');
const app = express();
const request = require('request');
const path = require('path');
const WebSocket = require('ws');

// Settings

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
//app.use(express.json());

// Routes
app.use(require('./routes/routes'));
app.use(require('./routes/views'));

// static files

// Starting the server

const server=app.listen(app.get('port'), () => {
  console.log('Server on port',app.get('port'));
  setInterval(interval, 1000*60*3);
});

const io = new WebSocket.Server({ server });
CLIENTS=[];
/*
wss.on('connection',function(ws){
    ws.on('message',function(message){
        console.log('recived:'+message);
        ws.send("From server "+message);
    });
});
*/
io.on('connection',function(ws){
  CLIENTS.push(ws);
  console.log('cliente nuevo')
  ws.on('message',function(obj){
 
      console.log('recived:'+obj)
      ws.send("Message: " + obj);
      sendAll(obj,ws);
  });
});

function sendAll (message,yo) {
  for (var i=0; i<CLIENTS.length; i++) {
    if(CLIENTS[i]!=yo)
      CLIENTS[i].send("Message: " +message);
  }
}



let interval = ()=>{

  console.log('hola mundo, no sleep');
  request('https://proyectoescom.herokuapp.com/', function (error, res, body) {
    if (!error && res.statusCode == 200) {
        
    }
});



}