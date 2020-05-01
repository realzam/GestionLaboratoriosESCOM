const express = require('express');
const request = require('request');
const path = require('path');
const WebSocket = require('ws');
const mysqlConnection  = require('./database.js');
var bodyParser = require('body-parser');

const app = express();
// Settings

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// Middlewares
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }))


app.use(bodyParser.json())
//app.use(express.json());

// Routes
app.use(require('./routes/routes'));
app.use(require('./routes/views'));

// static files

// Starting the server

const server=app.listen(app.get('port'), () => {
  console.log('Server on port',app.get('port'));
 // setInterval(interval, 1000*60*3);
});

function heartbeat() {
  this.isAlive = true;
}

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
  // ping
ws.send(0x9);
// pong
ws.send(0xA);

  ws.on('message',function(obj){
 
      console.log('recived:'+obj)
      if(obj=="/labs")
      {

        mysqlConnection.query('select l.idLaboratorio as id_laboratorio,l.estado ,count(*) as disponibles from Laboratorio l,Computadora c where c.idLaboratorio=l.idLaboratorio and c.estado="Disponible" group by l.idLaboratorio', (err, rows, fields) => {
          if(!err) {
            console.log(JSON.stringify(rows))
            ws.send(JSON.stringify(rows));
          } else {
            console.log(err);
          }
        }); 

      }
      else{
        ws.send("Message from server: " + obj);
      }
      
      sendAll(obj,ws);
  });
  ws.on('close', ()=>{
    console.log('websocket closed')
    })
});

function sendAll (message,yo) {
  for (var i=0; i<CLIENTS.length; i++) {
    if(CLIENTS[i]!=yo)
      CLIENTS[i].send("Message from server: " +message);
  }
}



let interval = ()=>{

  console.log('hola mundo, no sleep');
  request('https://proyectoescom.herokuapp.com/', function (error, res, body) {
    if (!error && res.statusCode == 200) {
        
    }
});



}