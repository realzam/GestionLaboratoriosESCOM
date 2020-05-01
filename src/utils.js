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

module.exports.getLabs=getLabs;
module.exports.modCompu=modCompu;