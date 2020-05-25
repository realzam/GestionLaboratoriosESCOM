const express = require('express');
const path = require('path');
const WebSocket = require('ws');
const bodyParser = require('body-parser');
const momento = require('./momento.js');
const utils = require('./utils.js');
const peticiones = require('./peticiones.js');
var request = require('request');
const moment = require('moment');
var momentzone = require('moment-timezone');
const updateSocket = require('./sendUpdateSockets.js');
const app = express();

// Settings
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Middlewares
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(require('./routes/routes'));
app.use(require('./routes/views'));

//global varibles
var timeOutReserva;
var timeOutSheduling;
global.labslist = [1105, 1106, 1107, 2103];
global.timersReserva = [];
global.reservaTime = 10;
global.reservaTimeType = 'minute';// second  minute

//momento.setFecha(moment('2020-05-19T12:09:00'));
utils.setTimersReservas();
const server = app.listen(app.get('port'), async () => {

  console.log('now', momento.momento().format('dddd D MMMM YYYY H:mm:ss:SSS'));
  var resp = await peticiones.getReservasEnEspera();
  for (const item of resp) {
    global.timersReserva.push(moment(item['fin']));
  }
  global.timersReserva.sort();
  scheduling();
  timerReserva(0);
  setInterval(interval2, 1000 * 60 * 5);
});

async function setHoraRoute() {
  clearTimeout(timeOutReserva);
  clearTimeout(timeOutSheduling);
  scheduling();
  timerReserva(2);
  var res = await updateSocket.sendServerDate();
  sendAll(res, null, null);
  updateSocket.sendUpdateLabs();

}

async function scheduling() {
  //console.log('horario',momento.momento().format('dddd MMMM YYYY H:mm:ss'));
  var dateS = await updateSocket.sendServerDate();
  sendAll(dateS, null, null);
  
  var hora;
  var dia = momento.momento().day();
  if (dia == 6 || dia == 0) {
    peticiones.setLaboratoriosEdo('No disponible', 0);
    await peticiones.setComputadorasEdo('Ocupada', 0);
  } else {
    hora = utils.getHoraID(momento.momento());
    if (hora == 3 || hora == 9) {
      peticiones.setLaboratoriosEdo('Tiempo Libre', 0);
      await peticiones.setComputadorasEdo('Disponible', 0);
    } else if (hora == 0) {
      peticiones.setLaboratoriosEdo('No disponible', 0);
      await peticiones.setComputadorasEdo('Ocupada', 0);
    }
    else {
      await forLoop1(hora, dia)
    }
    peticiones.setComputadorasReservadas(dia, hora)
  }
  updateSocket.sendUpdateLabs();
  timeOutSheduling = setTimeout(() => { scheduling() }, utils.nextTimer(momento.momento()) - momento.momento())

}


const forLoop1 = async (hora, dia) => {
  for (var i = 0; i < global.labslist.length; i++) {
    var edo = await peticiones.getLibreLaboratorio(global.labslist[i], hora, dia)
    peticiones.modEdoLab(global.labslist[i], edo)
    if (edo == "Tiempo libre") {
      await peticiones.setComputadorasEdo('Disponible', global.labslist[i]);
    } else {
      await peticiones.setComputadorasEdo('Ocupada', global.labslist[i]);
    }
  }
  return new Promise(resolve => resolve(true));
}

async function timerReserva(opc) {
  clearTimeout(timeOutReserva)
  if (opc == 2) {
    var formato = 'YYYY-MM-DD HH:mm:ss';
    await peticiones.reservaTimeOut(global.timersReserva[0].format(formato));
    global.timersReserva.shift();
    updateSocket.sendUpdateLabs();
    var dateS = await updateSocket.sendServerDate();
    sendAll(dateS, null, null);
    if (global.timersReserva.length == 0)
      utils.setTimersReservas()
  }
  timeOutReserva = setTimeout(() => { timerReserva(2) }, global.timersReserva[0] - momento.momento());

}

function noop() { }

function heartbeat() {
  this.isAlive = true;
}

let interval2 = () => {
  console.log('hola mundo, no sleep', momento.momento().format('dddd MMMM YYYY H:mm:ss'));
  request('https://proyectoescom.herokuapp.com/', function (error, res, body) {
    if (!error && res.statusCode == 200) { }
  })
}



const interval = setInterval(function ping() {
  io.clients.forEach(function each(ws) {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping(noop);
  });
}, 30000);



const io = new WebSocket.Server({ server });
CLIENTS = [];

io.on('connection', ws => {
  ws.on('disconnect', function () {
    console.log('adios');

  });
  CLIENTS.push(ws);
  console.log('cliente nuevo')
  ws.isAlive = true;
  ws.hola = 'mundo ' + Math.floor((Math.random() * 100) + 1);
  ws.on('pong', heartbeat);
  ws.idCliente = 'anonimo'
  //isAliveClient();
  ws.on('message', async (message) => {
    if (message.indexOf('/') != -1) {
      var s = message.split('/');
      var res;
      var para = null;
      switch (s[1]) {
        case 'labs':
          res = await peticiones.getLabs();
          break;
        case 'computadoras':
          res = await peticiones.getComputadoras(s[2])// /computadora/lab
          break;
        case 'computadorasFuture':
          res = await peticiones.getComputadorasFuture(s[2], s[3])// /computadorasFuture/lab/hora
          break;
        case 'infoS':
          res = await updateSocket.sendServerDate();
          break;
        case 'miReserva':
          res = await updateSocket.sendReserva(ws.idCliente);
          para = ws.idCliente;
          break;
        case 'id':
          var responseG = {}
          ws.idCliente = s[2];
          responseG['info'] = "bienvendio " + s[2];
          res = JSON.stringify(responseG);
          para = ws.idCliente;
          break;
        default:
          var responseG = {}
          responseG['info'] = "Comando";
          res = JSON.stringify(responseG);
          break;
      }
    } else {
      var responseG = {}
      responseG['info'] = "server  say" + message;
      res = JSON.stringify(responseG);
    }
    if (typeof res === 'string' || res instanceof String)
      ws.send(res);
    sendAll(res, ws, para)
  });

});

io.on('close', function close() {
  console.log('websocket closed')
  clearInterval(interval);
});

io.on('disconnect', function () {
  console.log('adios');
});

io.once('disconnect', function () {
  console.log('adios server');
});
function isAliveClient() {
  console.log('================================')
  for (let i = 0; i < CLIENTS.length;) {
    console.log(i, CLIENTS.length)
    if (CLIENTS[i].readyState == 3) {
      console.log('eliminando de la lista')
      CLIENTS.splice(i, 1);
      continue;
    }
    i++
  }
}

function sendAll(message, yo, to) {
  if (typeof message === 'string' || message instanceof String) {
    for (var i = 0; i < CLIENTS.length; i++) {

      if (CLIENTS[i] != yo) {
        if (to != null) {
          if (CLIENTS[i].idCliente == to)
            CLIENTS[i].send(message);
          continue;
        }
        CLIENTS[i].send(message);
      }
    }
  }

}


module.exports.timerReserva = timerReserva;
module.exports.sendAll = sendAll;
module.exports.setHoraRoute = setHoraRoute;


