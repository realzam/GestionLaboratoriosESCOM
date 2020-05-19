const index = require('./index.js');
const peticiones=require('./peticiones.js');
const momento= require('./momento.js');
const utils=require('./utils.js');
async function sendUpdateLabs()
{
  var res=await peticiones.getLabs();
  index.sendAll(res,null)
}

async function sendUpdateComputadoras(lab)
{
  var res= await peticiones.getComputadoras(lab)
  index.sendAll(res,null)
}


 function sendServerDate()
{
  return new Promise(resolve => {
    responseG={};
    responseG['comando']="/infoS"
    responseG['fecha_servidor']=momento.momento().format('YYYY-MM-DD HH:mm:ss');
    responseG['hora_id']=utils.getHoraID(momento.momento())
    res=JSON.stringify(responseG);
    resolve(res)
  });
}

module.exports.sendUpdateLabs=sendUpdateLabs;
module.exports.sendServerDate=sendServerDate;
module.exports.sendUpdateComputadoras=sendUpdateComputadoras;