const express = require('express');
const request = require('request');
const path = require('path');
const WebSocket= require('ws');
const bodyParser = require('body-parser');
const momento= require('./momento.js');
const utils=require('./utils.js');
const peticiones=require('./peticiones.js');
const app = express();
const moment = require('moment');
// Settings
//momento.setFecha(moment('2020-05-11T18:09:50'))

app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
// Middlewares
app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }))

var timeOutReserva;
global.dis=[]
global.labslist=[1105,1106,1107,2103];
global.timersReserva=[];
var inicio=momento.momento();
var idaux=utils.getHoraID(inicio);
var dateaxu=utils.getDateFromID(idaux).add(10,'minutes');
var major=utils.compareDate(inicio,dateaxu);
if(major== inicio)
{
  idaux++;
}
for (let i= idaux; i <=11; i++) {
  var d=utils.getDateFromID(i).add(10,'minutes');
  global.timersReserva.push(d);
}



app.use(bodyParser.json())

//app.use(express.json(
// Routes
app.use(require('./routes/routes'));
app.use(require('./routes/views'));
const server=app.listen(app.get('port'), () => {
  console.log('now',momento.momento().format('dddd D MMMM YYYY H:mm:ss'));
  scheduling();
  timerReserva(0);
  setInterval(interval2, 1000*60*5);
});

async function scheduling()
{
  //console.log('horario',momento.momento().format('dddd MMMM YYYY H:mm:ss'));
  var hora;
  var dia=momento.momento().day()
  if(dia==6||dia==0)
 {
  peticiones.setLaboratoriosEdo('No disponible',0);
  peticiones.setComputadorasEdo('Ocupada',0);
 }else{
  hora=utils.getHoraID(momento.momento())
  if(hora==3||hora==9)
  {
    peticiones.setLaboratoriosEdo('Tiempo Libre',0);
    peticiones.setComputadorasEdo('Disponible',0);
  }else if(hora==0)
  {
    peticiones.setLaboratoriosEdo('No disponible',0);
    peticiones.setComputadorasEdo('Ocupada',0);
  }
  else{
    for (var i=0;i<global.labslist.length;i++) {
      var edo=await peticiones.getLibreLaboratorio(labslist[i] ,hora,dia)
        peticiones.modEdoLab(labslist[i],edo)
        if(edo=="Tiempo libre")
        {
          peticiones.setComputadorasEdo('Disponible',labslist[i]);
        }else{
          peticiones.setComputadorasEdo('Ocupada',labslist[i]);
        }
    }
  }
  peticiones.setComputadorasReservadas(dia,hora)
}
  console.log('nextTimer',utils.nextTimer(momento.momento()).format('dddd DD MMMM YYYY H:mm:ss:SSS'));
  console.log('nextTimer',utils.nextTimer(momento.momento()).valueOf(),utils.nextTimer(momento.momento()).format('dddd DD MMMM YYYY H:mm:ss:SSS')  );
  console.log('momento  ',momento.momento().valueOf(),momento.momento().format('dddd DD MMMM YYYY H:mm:ss:SSS'))
  console.log('mimisecond to nexttimer sheduling',utils.nextTimer(momento.momento())-momento.momento());
  
  timpofaltante=setTimeout(()=>{scheduling()},utils.nextTimer(momento.momento())-momento.momento())

}
function timerReserva(opc) {
  clearTimeout(timeOutReserva)
  if(opc==2)
  {
    var formato='YYYY-DD-MM HH:mm:ss';
    peticiones.reservaTimeOut(global.timersReserva[0].format(formato));
    global.timersReserva.shift();
  }
  console.log('timers reserva list',global.timersReserva)
  console.log('timer reserva',global.timersReserva[0].format('dddd MMMM YYYY H:mm:ss'));

  timeOutReserva=setTimeout(()=>{timerReserva(2) },global.timersReserva[0]-momento.momento());

}

function noop() {}

function heartbeat() {
  this.isAlive = true;
}

let interval2 = ()=>{
  console.log('hola mundo, no sleep',momento.momento().format('dddd MMMM YYYY H:mm:ss'));
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


module.exports.timerReserva=timerReserva;


