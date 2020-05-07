const express = require('express');
const request = require('request');
const path = require('path');
const WebSocket= require('ws');
const bodyParser = require('body-parser');
const moment = require('moment');
const utils=require('./utils.js');
const peticiones=require('./peticiones.js');
const app = express();
// Settings
moment.locale('es');
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
const server=app.listen(app.get('port'), () => {
  console.log('now',moment().format('dddd MMMM YYYY H:mm:ss'));
 scheduling()
  setInterval(interval2, 1000*60*3);
});


async function scheduling()
{
  console.log('horario',moment().format('dddd MMMM YYYY H:mm:ss'));
  var hora;
  var dia=moment().day()
  if(dia==6||dia==0)
 {
  
  peticiones.setLaboratoriosEdo('No disponible',0);
  peticiones.setComputadorasEdo('Ocupadas',0);
 }else{
  hora=utils.getHoraID(moment())
  if(hora==3||hora==9)
  {
    peticiones.setLaboratoriosEdo('Tiempo Libre',0);
    peticiones.setComputadorasEdo('Disponilbe',0);
  }else{
    var labslist=[1105,1106,1107,2103];
    
    for (var i=0;i<labslist.length;i++) {
      var edo=await peticiones.getLibreLaboratorio(labslist[i] ,hora,dia)
        peticiones.modEdoLab(labslist[i],edo)
        if(edo="Tiempo libre")
        {
          peticiones.setComputadorasEdo('Disponible',labslist[i]);
        }
    }
  }

  peticiones.setComputadorasReservadas(dia,hora)
}
  console.log('nextTimer',utils.nextTimer(moment()).add(1,'second').format('dddd MMMM YYYY H:mm:ss'));
  timpofaltante=setTimeout(()=>{scheduling()},utils.nextTimer(moment())-moment()+1000)

}

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
          res=await peticiones.getLabs('');
          break;
        case 'modCompu':
          var resm=await peticiones.modCompu(s[2],s[3],s[4]);
          if(resm['ok'])
          {
            console.log('mod compu ok mysql')
            res=await peticiones.getLabs('/modcompu');
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



