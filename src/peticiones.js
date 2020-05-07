const mysqlConnection  = require('./database.js');

function getLabs(comm) {
  var responseG={}
  responseG['comando']='/labs';
  return new Promise(resolve => {
    mysqlConnection.query('select l.idLaboratorio as id_laboratorio,l.estado ,count(*) as disponibles from Laboratorio l,Computadora c where c.idLaboratorio=l.idLaboratorio and c.estado="Disponible" group by l.idLaboratorio', (err, rows, fields) => {
      if(!err) {
          var a=JSON.stringify(rows);
          responseG['ok']=true;
          responseG['info']=a;
      } else {
        responseG['ok']=false;
        responseG['info']=a;
      }
      resolve(JSON.stringify(responseG))
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
          resolve("Tiempo libre");
          
        }else{
          setComputadorasEdo('Ocupada',lab)
          resolve("En clase")
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




module.exports.getLabs=getLabs;
module.exports.modCompu=modCompu;
module.exports.modEdoLab=modEdoLab;
module.exports.setLaboratoriosEdo=setLaboratoriosEdo;
module.exports.setComputadorasEdo=setComputadorasEdo;

module.exports.getLibreLaboratorio=getLibreLaboratorio;
module.exports.setComputadorasReservadas=setComputadorasReservadas;
module.exports.modComputadoraEdo=modComputadoraEdo;