const express = require('express');
const request = require('request');
const path = require('path');
const WebSocket= require('ws');
const mysqlConnection  = require('./database.js');
var bodyParser = require('body-parser');
const moment = require('moment');
var momenttz = require('moment-timezone');

const app = express();
// Settings
moment.locale('es');
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.locals.moment = moment;
// Middlewares
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }))


app.use(bodyParser.json())
//app.use(express.json());

// Routes
app.use(require('./routes/routes'));
app.use(require('./routes/views'));
const util=require('./utils.js');

// static files

// Starting the server
const server=app.listen(app.get('port'), () => {
  console.log('now',momenttz().tz("America/Mexico_City").format('MMMM Do YYYY, h:mm:ss a'));
  
  console.log('Server on port',app.get('port'));
  setInterval(interval2, 1000*60*3);
});

function noop() {}

function heartbeat() {
  this.isAlive = true;
}

let interval2 = ()=>{
  console.log('hola mundo, no sleep');
  request('https://proyectoescom.herokuapp.com/', function (error, res, body) {
    if (!error && res.statusCode == 200) {
    }
});

}

const interval = setInterval(function ping() {
  io.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();

    ws.isAlive = false;
    ws.ping(noop);
  });
}, 30000);



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



io.on('connection',ws =>{
  CLIENTS.push(ws);
  console.log('cliente nuevo')
  ws.isAlive = true;
  ws.on('pong', heartbeat);
  ws.on('message',async (message)=>{
    if(message.indexOf('/')!=-1)
    {
      var s=message.split('/');
      var res;
      switch(s[1])
      {
        case 'labs':
          res=await util.getLabs('');
          break;
        case 'modCompu':
          var resm=await util.modCompu(s[2],s[3],s[4]);
          if(resm['ok'])
          {
            console.log('mod compu ok mysql')
            res=await util.getLabs('/modcompu');
          }else
          {
            res=JSON.stringify(resm);
          }
          
          break;
        default:
          res="comando"
          break

      }
    }else
    {
     res="server say"+message
    }
    ws.send(res);
    sendAll(res,ws)
  });

});




io.on('close', function close() {
  console.log('websocket closed')
  clearInterval(interval);
});

function sendAll (message,yo) {
  for (var i=0; i<CLIENTS.length; i++) {
    if(CLIENTS[i]!=yo)
      CLIENTS[i].send(message);
  }
}



