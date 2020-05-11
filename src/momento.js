var moment = require('moment-timezone');

moment.locale('es');

var fecha=null;
var init=null
function momento()
{   if(fecha==null)
        return moment().tz("America/Mexico_City");

        try
        {
            return moment(fecha+(moment().tz("America/Mexico_City")-init));
        }catch(e)
        {
            console.log('error al crear la fecha')
            console.log(e)
            return moment().tz("America/Mexico_City");
        }
    
    
}
function setFecha(param) {
    fecha=param;
    init=moment().tz("America/Mexico_City")
}

module.exports.momento=momento;
module.exports.setFecha=setFecha;