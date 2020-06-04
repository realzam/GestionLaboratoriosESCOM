var request = require('request');
const momento = require('./momento.js');
const mysqlConnection = require('./database.js');
const updateSocket = require('./sendUpdateSockets.js');
function Labs() {
  return new Promise(async function (resolve, reject) {
    //var sql='SELECT l.idLaboratorio as id_laboratorio,l.estado,(select count(*) from Computadora c where c.idLaboratorio = l.idLaboratorio and c.estado="Disponible") as disponibles FROM Laboratorio l WHERE l.idLaboratorio in (1105,1106,1107,2103)'
    var sql = 'SELECT l.idLaboratorio as id_laboratorio,l.estado,(select count(*) from Computadora c where c.idLaboratorio = l.idLaboratorio and c.estado="Disponible") as disponibles,JSON_ARRAYAGG( h.hora) as horas_libres FROM Laboratorio l, Horario h WHERE l.idLaboratorio in (1105,1106,1107,2103) and l.idLaboratorio=h.idHorario and h.dia=? and h.clase="Tiempo libre" group by l.idLaboratorio'
    var dia = momento.momento().day();
    if (dia == 6 || dia == 0) {
      dia = 1;
    }
    mysqlConnection.query(sql, [dia], (err, rows, fields) => {
      if (!err) {
        resolve(rows)
      } else {
        throw err
      }
    });
  });
}

const forLoop1 = async (lab) => {
  var dia = momento.momento().day()
  lista = [];
  for (var i = 0; i < lab.length; i++) {
    var resp = await getHorasLibres(lab[i]['id_laboratorio'], dia);
    lab[i]['horas_libres'] = resp;
  }
  return new Promise(resolve => resolve(1));
}

function getLabs() {
  return new Promise(async function (resolve, reject) {
    var responseG = {}
    responseG['comando'] = '/labs';
    responseG['ok'] = true;
    responseG['info'] = await Labs();
    resolve(JSON.stringify(responseG))
  });
}

function getHorasLibres(lab, dia) {
  return new Promise(function (resolve, reject) {
    var res;
    var lista = [];
    mysqlConnection.query('select hora from Horario where idHorario=? and dia=? and clase=?', [lab, dia, "Tiempo libre"], (err, rows, fields) => {
      if (!err) {
        res = rows;
      } else {
        console.log(err);
      }
      for (const item of res) {
        lista.push(item['hora'])
      }
      resolve(lista)
    });


  });

}

function modCompu(id, lab, edo) {

  if (id == null || lab == null || edo != edo) {

    return new Promise(resolve => {
      var responseG = {}
      responseG['comando'] = '/modCompu';
      responseG['ok'] = false;
      responseG['info'] = 'parameros nulos';
      resolve(responseG);
    })
  }
  return new Promise(resolve => {
    var responseG = {}
    mysqlConnection.query('update Computadora set estado = ? where idComputadora=? and idLaboratorio=?', [edo, id, lab], (err, rows, fields) => {
      if (!err) {
        responseG['ok'] = true;
        responseG['lab'] = lab;
        responseG['edo'] = edo;
      } else {
        console.log(err)
        responseG['ok'] = false;
        responseG['comando'] = '/modCompu';
        responseG['info'] = err;
      }
      console.log('mod compu()', responseG)
      resolve(responseG)
    });

  });
}

function setLaboratoriosEdo(edo) {
  mysqlConnection.query('update Laboratorio set estado = ?', [edo], (err, rows, fields) => {
    if (!err) {
      console.log('todos los laboratorios en', edo)
    } else {
      console.log('error', err)
    }
  });
}

function setComputadorasEdo(edo, lab) {
  return new Promise(resolve => {
    var sql;
    var parameros = [];
    parameros.push(edo);
    if (lab == 0) {
      sql = "update Computadora set estado = ?";
    } else {
      sql = "update Computadora set estado = ? where idLaboratorio = ?";
      parameros.push(lab);
    }
    mysqlConnection.query(sql, parameros, (err, rows, fields) => {
      if (!err) {
        console.log('todas las Computadoras del laboratorio' + lab + ' estan ' + edo)
        resolve(true)
      } else {
        console.log('error', err)
      }
    });
  });
}


function modComputadoraEdo(edo, lab) {
  var sql;
  var parameros = [];
  if (lab == 0) {
    sql = "update Computadora set estado = ?";
    parameros.push(edo)
  } else {
    sql = "update Computadora set estado = ? where idLaboratorio = ?";
    parameros.push(edo);
    parameros.push(lab);
  }
  mysqlConnection.query(sql, parameros, (err, rows, fields) => {
    if (!err) {
      console.log('todas las Computadoras del laboratorio' + lab + ' estan ' + edo)
    } else {
      console.log('error', err)
    }
  });
}

function setComputadorasReservadas(dia, hora, ) {
  var sql = "update Computadora c,ReservaComputadora r set c.estado='Reservada' where r.estado='En espera' and r.dia=? and r.hora=? and r.idLaboratorio=c.idLaboratorio and r.idComputadora=c.idComputadora"
  return new Promise(function (resolve, reject) {
    mysqlConnection.query(sql, [dia, hora], (err, rows, fields) => {
      if (!err) {
        console.log('reservar hechas:', rows['changedRows'])
      } else {
        console.log(err)
      }
    });
  })
}


function getLibreLaboratorio(lab, hora, dia) {
  return new Promise(function (resolve, reject) {
    mysqlConnection.query('select clase from Horario where idHorario= ? and hora= ? and dia= ?', [lab, hora, dia], (err, rows, fields) => {
      if (!err) {
        if (rows[0]['clase'] == 'Tiempo libre') {
          resolve('Tiempo libre');

        } else {
          resolve('En clase')
        }
      } else {
        console.log(err)
        resolve("Error")
      }
    });
  });
}

function modEdoLab(lab, edo) {
  mysqlConnection.query('update Laboratorio set estado = ? where idLaboratorio= ?', [edo, lab], (err, rows, fields) => {
    if (!err) {
      console.log("Laboratorio " + lab + " esta " + edo)
    } else {
      console.log(err)
    }
  });
}

async function reservaTimeOut(date) {
  return new Promise(async function (resolve, reject) {
    var edo = "No confirmada";
    var edo2 = "En espera";
    console.log('reservaTimeOut date', date)

    await getreservaTimeOutNotification(date);
    mysqlConnection.query('update ReservaComputadora set estado=? where fin=? and estado=?', [edo, date, edo2], (err, rows, fields) => {
      if (!err) {
        console.log(rows['changedRows'] + ' reservas no completadas')
        resolve(true)
      } else {
        console.log(err)
      }
    });
  });
}

function getreservaTimeOutNotification(date) {
  return new Promise(resolve => {
    var sql="select t.usuario, r.idComputadora,r.idLaboratorio,JSON_ARRAYAGG(t.idToken) as tokenNoti from ReservaComputadora r, TokenNotification t where r.fin=? and r.estado='En espera' and r.idUsuario=t.usuario group by t.usuario"
    mysqlConnection.query(sql, [date], async (err, rows, fields) => {
      if (!err) {
        console.log('reservaTimeOutSendNotification', rows.length)
        if (rows.length > 0) {
          for (let i = 0; i < rows.length; i++) {
            const element = rows[i];
            await modCompu(element['idComputadora'], element['idLaboratorio'], 'Disponible')
            updateSocket.sendUpdateComputadoras(element['idLaboratorio'])
            updateSocket.sendUpdateReservaAdmin(element['idLaboratorio'],element['tipoUsuario']);
          }
          
          //enviarNotificacion(rows)
        }

        resolve(true)
      } else {
        console.log(err)
        resolve(false)
      }
    });
  });
}

function enviarNotificacion(usuarios) {
  var destinos = [];
  if (usuarios.length == 1) {
    const element = usuarios[0]['idToken'];
    destinos.push(element);
  }
  else {
    for (let i = 0; i < usuarios.length; i++) {
      const element = usuarios[i]['idToken'];
      destinos.push(element);
    }
  }
  console.log('detinos', destinos);
  var options = {
    uri: 'https://fcm.googleapis.com/fcm/send',
    headers: { 'content-type': 'application/json', 'Authorization': 'key=AAAAdEXNXUo:APA91bG5xbYp7xLESUmR-r9hwC0-aJR6QWQgd6b9cDrKhmIEbPXKtWk_LfqFEehaD_0LLW93cmmHclT46PNVqu4AkS3qB3gaclK4k_HEtx4pRH_40lsumch6XRcyPLvA-jpiIVCV1ZG9' },
    method: 'POST',
    json: {
      "registration_ids": destinos,
      "notification": {
        "title": "Control ESCOM",
        "body": "Se agoto el tiempo de tu reserva"
      },
      "priority": "high",
      "data": {
        "info": "Se agoto el tiempo de tu reserva",
        "click_action": "FLUTTER_NOTIFICATION_CLICK"
      }
    }
  };

  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      console.log(body) // Print the shortened url.
    }
  });

}

function getComputadoras(lab) {
  var responseG = {}
  responseG['comando'] = '/computadoras';
  responseG['lab'] = lab;
  return new Promise(resolve => {
    mysqlConnection.query('select idComputadora as id_computadora,idLaboratorio as id_laboratorio,estado from Computadora where idLaboratorio=? order by idComputadora', [lab], (err, rows, fields) => {
      if (!err) {
        responseG['ok'] = true;
        responseG['info'] = rows
        resolve(JSON.stringify(responseG))
      } else {
        console.log(err)
      }
    });
  });
}
const forLoop2 = async (hora, dia) => {
  var lista = [];
  var compu = {}
  for (var i = 1; i <= 34; i++) {
    compu['idComputadora'] = i;
    lista.push(Object.assign({}, compu))
  }
  return new Promise(resolve => resolve(lista));
}

function getLaboratorioReservado(lab, hora) {
  return new Promise(resolve => {
    mysqlConnection.query('select *  from ReservaLaboratorio where idLaboratorio=? and hora=? and estado=?', [lab, hora, "En espera"], (err, rows, fields) => {
      if (!err) {
        resolve(rows)
      } else {
        console.log(err)
      }
    });
  });
}
function getComputadorasReservadas(lab, hora) {
  return new Promise(resolve => {
    mysqlConnection.query('select * from ReservaComputadora where idLaboratorio=? and hora=? and estado="En espera" order by idComputadora', [lab, hora], (err, rows, fields) => {
      if (!err) {
        resolve(rows)
      } else {
        console.log(err)
      }
    });
  });
}

function getComputadorasFuture(lab, hora) {
  return new Promise(async function (resolve, reject) {
    var responseG = {}
    responseG['comando'] = '/computadorasFuture';
    responseG['hora'] = hora;
    responseG['lab'] = lab;
    responseG['ok'] = true;
    var compusl = [];
    var reservadas = [];
    var res = await getLaboratorioReservado(lab, hora);

    if (res.length == 1) {
      res = await forLoop2();
      //console.log(res)
    } else {
      res = await getComputadorasReservadas(lab, hora);
    }
    for (const item of res) {
      //console.log(item)
      reservadas.push(item['idComputadora']);
    }
    for (let i = 1; i <= 34; i++) {
      var index = reservadas.indexOf(i);
      var compu = {}
      compu["id_computadora"] = i;
      compu["id_laboratorio"] = parseInt(lab);
      compu["estado"] = (index != -1) ? 'No diponible' : 'Disponible';
      compusl.push(compu);
    }
    responseG['info'] = compusl;
    resolve(JSON.stringify(responseG))
  });
}

function getReservasEnEspera() {
  return new Promise(async function (resolve, reject) {
    mysqlConnection.query('select fin  from ReservaComputadora where estado="En espera" order by 1', (err, rows, fields) => {
      if (!err) {
        resolve(rows)
      } else {
        console.log(err)
      }
    });
  });
}
function miReserva(boleta) {
  return new Promise(resolve => {
    mysqlConnection.query('select idUsuario as id_usuario,idComputadora as id_computadora,idLaboratorio as id_laboratorio,inicio,dia,hora,fin,estado from ReservaComputadora where idUsuario=? and (estado="En espera" or estado="En uso")', [boleta], (err, rows, fields) => {
      if (!err) {
        resolve(rows);
      } else {
        console.log(err);
      }
    });
  });
}

function miReserva2(usuario) {
  return new Promise(resolve => {
    mysqlConnection.query('select idUsuario as id_usuario,idLaboratorio as id_laboratorio,inicio,dia,hora,fin,estado from ReservaLaboratorio where idUsuario=? and (estado="En espera" or estado="En uso")', [usuario], (err, rows, fields) => {
      if (!err) {
        resolve(rows);
      } else {
        console.log(err);
      }
    });
  });
}

function getReservasAdminInfo(admin, tipo) {
  var sql = '';
  if (tipo == 1) {
    sql = 'select r.idUsuario as id_usuario,u.nombre, r.idComputadora as id_computadora, r.idLaboratorio as id_laboratorio,r.inicio,r.dia,r.hora,r.fin,r.estado from ReservaComputadora r,Usuario u where r.idLaboratorio=? and u.id=r.idUsuario and u.tipoUsuario=1 and(r.estado="En espera" or r.estado="En uso") order by r.hora';
  } else
    sql = 'select r.idUsuario as id_usuario,u.nombre, r.idLaboratorio as id_laboratorio,r.inicio,r.dia,r.hora,r.fin,r.estado from ReservaLaboratorio r,Usuario u where r.idLaboratorio=? and u.id=r.idUsuario and(r.estado="En espera" or r.estado="En uso") order by r.hora';
    return new Promise(resolve => {
    mysqlConnection.query(sql, [admin], (err, rows, fields) => {
      if (!err) {
        resolve(rows);
      } else {
        console.log(err);
      }
    });
  });
}

function getReservasAdmin(admin, tipo) {
 
  return new Promise(async function (resolve, reject) {
    responseG={}
    var info = await getReservasAdminInfo(admin, tipo);
    responseG['comando'] = '/reservasAdmin';
    responseG['ok'] = true;
    responseG['tipo'] = tipo;
    responseG['lab'] = admin;
    responseG['info'] = info;
    var res=JSON.stringify(responseG);
    resolve(res);
  });
}

module.exports.getLabs = getLabs;
module.exports.getLibreLaboratorio = getLibreLaboratorio;
module.exports.Labs = Labs;
module.exports.getComputadoras = getComputadoras;
module.exports.getComputadorasFuture = getComputadorasFuture;
module.exports.getHorasLibres = getHorasLibres;
module.exports.getReservasEnEspera = getReservasEnEspera;

module.exports.modCompu = modCompu;
module.exports.modEdoLab = modEdoLab;
module.exports.modComputadoraEdo = modComputadoraEdo;

module.exports.setLaboratoriosEdo = setLaboratoriosEdo;
module.exports.setComputadorasEdo = setComputadorasEdo;
module.exports.setComputadorasReservadas = setComputadorasReservadas;


module.exports.reservaTimeOut = reservaTimeOut;
module.exports.miReserva = miReserva;
module.exports.miReserva2 = miReserva2;
module.exports.getLaboratorioReservado = getLaboratorioReservado;
module.exports.getComputadorasReservadas = getComputadorasReservadas;
module.exports.getReservasAdmin = getReservasAdmin;