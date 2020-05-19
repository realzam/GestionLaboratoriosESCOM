var request = require('request');
const momento= require('./momento.js');
const mysqlConnection  = require('./database.js');
const updateSocket=require('./sendUpdateSockets.js');
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
var dia=momento.momento().day()
global.dis=[];
horas=[];
  for (const item of global.labslist) {
    var c=await getCompusDisponibles(item);
   var d=await getHorasLibres(item,dia);
    global.dis.push(c);
    horas.push(d);
  }
  var labs=await Labs();
  var i=0;
   for (const item of labs) {
     item['disponibles']=dis[i];
     item['horas_libres']=horas[i];
     i++;
    }

  return labs;
}


async function getLabs() {
  return new Promise( async function (resolve, reject) {
  var responseG={}
  responseG['comando']='/labs';
  responseG['ok']=true;
  responseG['info']=await getLabsInfo();
  /*responseG['fecha_servidor']=momento.momento().format('YYYY-MM-DD HH:mm:ss');
  responseG['hora_id']=utils.getHoraID(momento.momento())*/
  resolve(JSON.stringify(responseG))
});
}

function getHorasLibres(lab,dia) {
  return new Promise(  function (resolve, reject) {
    var res;
    var lista=[];
    mysqlConnection.query('select hora from Horario where idHorario=? and dia=? and clase=?',[lab,dia,"LIBRE"], (err, rows, fields) => {
      if(!err)
      {
        res=rows;
      }else
      {
        console.log(err);
      }
      for (const item of res) {
        lista.push(item['hora'])
      }
      resolve(lista)
    });


  });
  
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
  var sql="update Computadora c,ReservaComputadora r set c.estado='Reservada' where r.estado='En espera' and r.dia=? and r.hora=? and r.idLaboratorio=c.idLaboratorio and r.idComputadora=c.idComputadora"
  return new Promise(function (resolve, reject) {
    mysqlConnection.query(sql, [dia,hora], (err, rows, fields) => {
      if (!err) {
        console.log('reservar hechas:',rows['changedRows'])
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
  return new Promise( async function (resolve, reject) {
    var edo="No confirmada";
    var edo2="En espera";
    console.log('reservaTimeOut date',date)

    await getreservaTimeOutNotification(date);
    mysqlConnection.query('update ReservaComputadora set estado=? where fin=? and estado=?',[edo,date,edo2], (err, rows, fields) => {
      if (!err) {
       console.log(rows['changedRows']+ ' reservas no completadas')  
       resolve(true)
     }else{
       console.log(err)
     }
   });
  });
}

function getreservaTimeOutNotification(date) {
  var edo="En espera";
  return new Promise(resolve => {
    mysqlConnection.query('select r.idComputadora,r.idLaboratorio,t.idToken from ReservaComputadora r, TokenNotification t where r.fin=? and r.estado=? and r.idUsuario=t.usuario',[date,edo],async (err, rows, fields) => {
      if (!err) {
      console.log('reservaTimeOutSendNotification',rows.length)
      if(rows.length>0)
      {
        for (let i = 0; i < rows.length; i++) {
          const element = rows[i];
          await modCompu(element['idComputadora'],element['idLaboratorio'],'Disponible')
          updateSocket.sendUpdateComputadoras(element['idLaboratorio'])
        }
        
        enviarNotificacion(rows)
      }
        
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

function getComputadoras(lab)
{
  var responseG={}
  responseG['comando']='/computadoras';
  return new Promise(resolve => {
    mysqlConnection.query('select idComputadora as id_computadora,idLaboratorio as id_laboratorio,estado from Computadora where idLaboratorio=? order by idComputadora',[lab], (err, rows, fields) => {
      if (!err) {
        responseG['ok']=true;
        responseG['info']=rows
        resolve(JSON.stringify(responseG))
     }else{
       console.log(err)
     }
   });
  });
}
function getComputadorasReservadas(lab,hora) {
  return new Promise(resolve => {
  mysqlConnection.query('select idComputadora  from ReservaComputadora where idLaboratorio=? and hora=? and estado="En espera" order by idComputadora',[lab,hora], (err, rows, fields) => {
    if (!err) {
        resolve(rows)
    }else{
      console.log(err)
    }
  });
});
}
function getComputadorasFuture(lab,hora)
{
  return new Promise( async function (resolve, reject) {
      var responseG={}
      responseG['comando']='/computadorasFuture';
      responseG['ok']=true;
      var compusl=[];
      var res=await getComputadorasReservadas(lab,hora);
      var reservadas=[];
    for (const item of res) {
      reservadas.push(item['idComputadora']);
    }
    for (let i = 1; i <= 34; i++) {
      var index=reservadas.indexOf(i);
      var compu={}
      compu["id_computadora"]=i;
      compu["id_laboratorio"]=lab;
      compu["id_laboratorio"]=(index!=-1)?'No diponible':'Disponible';
      compusl.push(compu);
    }
    responseG['info']=compusl;
    resolve(JSON.stringify(responseG))
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
module.exports.getComputadoras=getComputadoras;
module.exports.getComputadorasFuture=getComputadorasFuture;
module.exports.getHorasLibres=getHorasLibres;