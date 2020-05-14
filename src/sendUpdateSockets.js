const index = require('./index.js');
const peticiones=require('./peticiones.js');

async function sendUpdateLabs()
{
  var res=await peticiones.getLabs();
  index.sendAll(res,null)
}

module.exports.sendUpdateLabs=sendUpdateLabs;