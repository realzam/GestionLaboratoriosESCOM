var moment = require('moment-timezone');

moment.locale('es');

var fecha=null;
var init=null

function momento()
{   if(fecha==null)
   
        return moment(moment().tz("America/Mexico_City").format('YYYY-MM-DTHH:mm:ss.SSS'));

        try
        {
            return moment(fecha+(moment(moment().tz("America/Mexico_City").format('YYYY-MM-DTHH:mm:ss.SSS'))-init));
        }catch(e)
        {
            console.log('error al crear la fecha')
            console.log(e)
            return moment(moment().tz("America/Mexico_City").format('YYYY-MM-DTHH:mm:ss.SSS'))
        }
    
    
}
function setFecha(param) {
    fecha=param;//moment()
    init=moment(moment().tz("America/Mexico_City").format('YYYY-MM-DTHH:mm:ss.SSS'))
}

module.exports.momento=momento;
module.exports.setFecha=setFecha;