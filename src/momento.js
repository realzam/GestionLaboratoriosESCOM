var momentz = require('moment-timezone');
const moment = require('moment');
moment.locale('es');

var fecha=null;
var init=null

function momento()
{   if(fecha==null)

    return moment(momentz().tz("America/Mexico_City").format('YYYY-MM-DDTHH:mm:ss.SSS'));

        try
        {
            return moment(fecha+(moment(momentz().tz("America/Mexico_City").format('YYYY-MM-DDTHH:mm:ss.SSS'))-init));
        }catch(e)
        {
            console.log('error al crear la fecha')
            console.log(e)
            return moment(momentz().tz("America/Mexico_City").format('YYYY-MM-DDTHH:mm:ss.SSS'))
        }
    
    
}
function setFecha(param) {
    fecha=param;//moment()
    init=moment(momentz().tz("America/Mexico_City").format('YYYY-MM-DDTHH:mm:ss.SSS'))
}

module.exports.momento=momento;
module.exports.setFecha=setFecha;