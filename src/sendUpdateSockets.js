const index = require('./index.js');
const peticiones=require('./peticiones.js');
const momento= require('./momento.js');
const utils=require('./utils.js');
async function sendUpdateLabs()
{
  var res=await peticiones.getLabs();
  index.sendAll(res,null,null)
}

async function sendUpdateComputadoras(lab)
{
  var res= await peticiones.getComputadoras(lab)
  index.sendAll(res,null,null)
}
async function sendUpdateReserva(boleta)
{
  var res= await sendReserva(boleta)
  index.sendAll(res,null,boleta)
}


async function sendUpdateComputadorasFuture(lab,hora)
{
  var res= await peticiones.getComputadorasFuture(lab,hora);
  index.sendAll(res,null,null);
}

 function sendServerDate()
{
  return new Promise(resolve => {
    responseG={};
    responseG['comando']="/infoS"
    responseG['fecha_servidor']=momento.momento().format('YYYY-MM-DD HH:mm:ss');
    responseG['hora_id']=utils.getHoraID(momento.momento())
    responseG['dia']= momento.momento().day();
    var res=JSON.stringify(responseG);
    resolve(res)
  });
}

 function sendReserva(boleta)
{
  return new Promise( async function (resolve) {
    responseG={};
    responseG['comando']="/miReserva"
    console.log('reserva de',boleta)
    var reservas=[];
    var info=await peticiones.miReserva(boleta);
    var info2=await peticiones.miReserva2(boleta);
    if(info.length>0)
    {
      info[0].tipo=1;
      reservas.push(info[0]);
    }
    if(info2.length>0)
    {
      info2[0].tipo=2;
      reservas.push(info2[0]);
    }
    
    if(reservas.length>0)
    responseG['info']=reservas;
    else
    responseG['status']=false;

    var res=JSON.stringify(responseG);
    resolve(res)
  });
}
module.exports.sendUpdateLabs=sendUpdateLabs;
module.exports.sendServerDate=sendServerDate;
module.exports.sendUpdateComputadoras=sendUpdateComputadoras;
module.exports.sendUpdateComputadorasFuture=sendUpdateComputadorasFuture;
module.exports.sendReserva=sendReserva;
module.exports.sendUpdateReserva=sendUpdateReserva;