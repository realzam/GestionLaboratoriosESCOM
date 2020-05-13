const mysqlConnection  = require('./database.js');
var request = require('request');
function Labs() {
  return new Promise( async function (resolve, reject) {
    mysqlConnection.query('select idLaboratorio as id_laboratorio,estado from Laboratorio', (err, rows, fields) => {
      if(!err) {
          resolve(rows)
      } else {
        throw err
      }
    }); 
  });
}

async function getLabsInfo() {
global.dis=[]
  for (const item of global.labslist) {
    var c=await getCompusDisponibles(item)
   //console.log(item,c);
    global.dis.push(c)
  }
  var labs=await Labs();
  var i=0;
   for (const item of labs) {
     item['disponibles']=dis[i]
     i++
    }

  return labs
}


async function getLabs() {
  var responseG={}
  responseG['comando']='/labs';
  responseG['info']=await getLabsInfo();
  resolve(JSON.stringify(responseG))
}

function modCompu(id,lab,edo) {
  
  if(id==null || lab==null || edo!=edo)
  {
    
    return new Promise(resolve => {
      var responseG={}
    responseG['comando']='/modCompu';
    responseG['ok']=false;
    responseG['info']='parameros nulos';
      resolve(responseG);
    })
  }
  return new Promise(resolve => {
    var responseG={}
    mysqlConnection.query('update Computadora set estado = ? where idComputadora=? and idLaboratorio=?', [edo,id,lab], (err, rows, fields) => {
      if (!err) {
        responseG['ok']=true;
      } else {
        console.log(err)
        responseG['ok']=false;
        responseG['comando']='/modCompu';
        responseG['info']=err;
      }
      console.log('mod compu()',responseG)
      resolve(responseG)
    });

  });
}

function setLaboratoriosEdo(edo) {
    mysqlConnection.query('update Laboratorio set estado = ?', [edo], (err, rows, fields) => {
      if (!err) {
        console.log('todos los laboratorios en',edo)
      } else {
        console.log('error',err)
      }
    });
}

function setComputadorasEdo(edo,lab) {

  var sql;
  var parameros=[];
  parameros.push(edo);
  if(lab==0)
  {
    sql="update Computadora set estado = ?";
  }else
  {
    sql="update Computadora set estado = ? where idLaboratorio = ?";
    parameros.push(lab);
  }
  mysqlConnection.query(sql, parameros, (err, rows, fields) => {
    if (!err) {
      console.log('todas las Computadoras del laboratorio'+lab+' estan '+edo)
    } else {
      console.log('error',err)
    }
  });
}


function modComputadoraEdo(edo,lab) {
  var sql;
  var parameros=[];
  if(lab==0)
  {
    sql="update Computadora set estado = ?";
    parameros.push(edo)
  }else
  {
    sql="update Computadora set estado = ? where idLaboratorio = ?";
    parameros.push(edo);
    parameros.push(lab);
  }
  mysqlConnection.query(sql, parameros, (err, rows, fields) => {
    if (!err) {
      console.log('todas las Computadoras del laboratorio'+lab+' estan '+edo)
    } else {
      console.log('error',err)
    }
  });
}

function setComputadorasReservadas(dia,hora,) {
  var sql="update Computadora as c,ReservaComputadora as r set c.estado='Reservada' where r.estado='En curso' and r.dia=? and r.hora=? and r.idLaboratorio=c.idLaboratorio and r.idComputadora=c.idComputadora"
  return new Promise(function (resolve, reject) {
    mysqlConnection.query(sql, [dia,hora], (err, rows, fields) => {
      if (!err) {
        console.log('reservar hechas')
      }else{
        console.log(err)
      }
    });
  })
 }


function  getLibreLaboratorio(lab,hora,dia) {
  return new Promise(function (resolve, reject) {

    mysqlConnection.query('select clase from Horario where idHorario= ? and hora= ? and dia= ?', [lab,hora,dia], (err, rows, fields) => {
      if (!err) {

        if(rows[0]['clase']=="LIBRE")
        {
          resolve('Tiempo libre');
          
        }else{
          resolve('En clase')
        }
      }else{
        console.log(err)
        resolve("Error")
      }
    });
  });
}

function modEdoLab(lab,edo) {
  mysqlConnection.query('update Laboratorio set estado = ? where idLaboratorio= ?',[edo,lab], (err, rows, fields) => {
     if (!err) {
      console.log("Laboratorio "+lab+" esta "+edo)
    }else{
      console.log(err)
    }
  });
}

function getCompusDisponibles(lab)
{
  return new Promise(resolve => {
  mysqlConnection.query('select ifNULL(count(*),0) as count from Computadora where idLaboratorio=? and estado=?',[lab,"Disponible"], (err, rows, fields) => {
    if (!err) {
     resolve(rows[0]['count'])
   }else{
     console.log(err)
   }
 });
});
}

async function reservaTimeOut(date) {

    var edo="No confirmada";
    var edo2="En espera";
    console.log('reservaTimeOut date',date)

    await getreservaTimeOutNotification(date);
    mysqlConnection.query('update ReservaComputadora set estado=? where fin=? and estado=?',[edo,date,edo2], (err, rows, fields) => {
      if (!err) {
       console.log(rows['changedRows']+ ' reservas no completadas')  
     }else{
       console.log(err)
     }
   });
}
function getreservaTimeOutNotification(date) {
  var edo="En espera";
  return new Promise(resolve => {
    mysqlConnection.query('select r.idUsuario,t.idToken from ReservaComputadora r, TokenNotification t where r.fin=? and r.estado=? and r.idUsuario=t.usuario',[date,edo], (err, rows, fields) => {
      if (!err) {
      console.log('reservaTimeOutSendNotification',rows.length)
      if(rows.length>0)
        enviarNotificacion(rows)
      resolve(true)
    }else{
      console.log(err)
      resolve(false)
    }
  });
 });
}
function enviarNotificacion(usuarios)
{
  var destinos=[];
  if(usuarios.length==1)
  {
    const element = usuarios[0]['idToken'];
    destinos.push(element);
  }
  else
  {
    for (let i = 0; i < usuarios.length; i++) {
      const element = usuarios[i]['idToken'];
      destinos.push(element);
    }
  }
  console.log('detinos',destinos);
  var options = {
    uri: 'https://fcm.googleapis.com/fcm/send',
    headers: {'content-type' : 'application/json','Authorization':'key=AAAAdEXNXUo:APA91bG5xbYp7xLESUmR-r9hwC0-aJR6QWQgd6b9cDrKhmIEbPXKtWk_LfqFEehaD_0LLW93cmmHclT46PNVqu4AkS3qB3gaclK4k_HEtx4pRH_40lsumch6XRcyPLvA-jpiIVCV1ZG9'},
    method: 'POST',
    json: {
      "registration_ids":destinos,
      "notification":{
        "title":"Control ESCOM",
        "body":"Se agoto el tiempo de tu reserva"
      },
      "priority": "high",
      "data":{
        "info":"Se agoto el tiempo de tu reserva",
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

module.exports.getLabs=getLabs;
module.exports.modCompu=modCompu;
module.exports.modEdoLab=modEdoLab;
module.exports.setLaboratoriosEdo=setLaboratoriosEdo;
module.exports.setComputadorasEdo=setComputadorasEdo;

module.exports.getLibreLaboratorio=getLibreLaboratorio;
module.exports.setComputadorasReservadas=setComputadorasReservadas;
module.exports.modComputadoraEdo=modComputadoraEdo;

module.exports.getCompusDisponibles=getCompusDisponibles;
module.exports.getLabsInfo=getLabsInfo;
module.exports.reservaTimeOut=reservaTimeOut;