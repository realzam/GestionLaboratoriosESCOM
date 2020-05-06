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

function modEdoLab(hora,lab,dia) {
var edo;
    mysqlConnection.query('select clase from Horario where idHorario= ? and hora= ? and dia= ?', [lab,hora,dia], (err, rows, fields) => {
      if (!err) {
      //  console.log('rows',rows);
       // console.log('row clase',rows[0]['clase']);
        if(rows[0]['clase']=="LIBRE")
        {
          edo="Tiempo libre",
          setComputadorasEdo('Disponible',lab)
        }else{
          edo="En Clase",
          setComputadorasEdo('Ocupada',lab)
        }
          
          mysqlConnection.query('update Laboratorio set estado = ? where idLaboratorio= ?', [edo, lab], (err2, rows2, fields2) => {
            if (!err2) { 
              console.log('laboratorio'+lab+' en' +edo)
            } else {
              console.log('error',err2)
            }
          });
      } else {
     console.log('error',err)
      }
    });
}


module.exports.getLabs=getLabs;
module.exports.modCompu=modCompu;
module.exports.modEdoLab=modEdoLab;
module.exports.setLaboratoriosEdo=setLaboratoriosEdo;
module.exports.setComputadorasEdo=setComputadorasEdo;