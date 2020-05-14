const index = require('./index.js');
const momento= require('./momento.js');

function nextTimer(date,opc)
{
  var now=date.clone();
  var addtime=0
  if(opc!=null)
  {
   addtime=global.reservaTime
  }

  var compare=compareDate(now,getDateFromID(11).add(addtime,global.reservaTimeType))
  if( (now.day()==5 && compare==now) || now.day()==6 || now.day()==0 )
  {
    now=setHora(now.day(1).add(7,'day'),7,0,0).add(addtime,global.reservaTimeType)
   // console.log('nexTimerReserva',now.format('dddd D MMMM YYYY H:mm:ss'))
    return now;
  }
  var id=getHoraID(now);
  var res=(id==-1||id==11)?setHora(now.add(1,'day'),7,0,0).add(addtime,global.reservaTimeType):getDateFromID(id+1).add(addtime,global.reservaTimeType);
  //console.log('nexTimer',res.format('dddd D MMMM YYYY H:mm:ss'));
  return res;   
}

function compareDate(a,b)
{

if(a.year()!=b.year())
{
  return a.year()>b.year()?a:b;
}
if(a.dayOfYear()!=b.dayOfYear())
{
  return a.dayOfYear()>b.dayOfYear()?a:b;
}

if(a.hour()!=b.hour())
{
  return a.hour()>b.hour()?a:b;
}

if(a.minute()!=b.minute())
{
  return a.minute()>b.minute()?a:b;
}

if(a.second()!=b.second())
{
  return a.second()>b.second()?a:b;
}
return a.millisecond()>=b.millisecond()?a:b;
}

function getHoraID(hoy)//devuelve el id de una fecha
{

  var aux=hoy.clone()
  aux=setHora(aux,6,59,59,999);
  if(compareDate(hoy,aux)==aux)
      return 0;
   aux=setHora(aux,8,29,59,999)
   if(compareDate(hoy,aux)==aux)
      return 1;
   aux=setHora(aux,9,59,59,999)
   if(compareDate(hoy,aux)==aux)
      return 2;
   aux=setHora(aux,10,29,59,999)
   if(compareDate(hoy,aux)==aux)
     return 3;
   aux=setHora(aux,11,59,59,999)
   if(compareDate(hoy,aux)==aux)
       return 4;
   aux=setHora(aux,13,29,59,999)
   if(compareDate(hoy,aux)==aux)
     return 5;
   aux=setHora(aux,14,59,59,999)
   if(compareDate(hoy,aux)==aux)
      return 6;
   aux=setHora(aux,16,29,59,999)
   if(compareDate(hoy,aux)==aux)
     return 7;
   aux=setHora(aux,17,59,59,999)
   if(compareDate(hoy,aux)==aux)
     return 8;
   aux=setHora(aux,18,29,59,999)
   if(compareDate(hoy,aux)==aux)
     return 9;
   aux=setHora(aux,19,59,59,999)
   if(compareDate(hoy,aux)==aux)
     return 10;
     aux=setHora(aux,21,29,59,999)
     if(compareDate(hoy,aux)==aux)
     return 11;
 return -1;
}

function setHora(date,h,m,s,mm)
{
    if(mm==null)
      mm=0;
  var res=date.clone().hour(h).minute(m).second(s).millisecond(mm);
  return res;
}

function getDateFromID(id)
{
  var aux=momento.momento().clone();
 switch (id) {
    case 1:
      return setHora(aux,7,00,00)
    case 2:
      return setHora(aux,8,30,00)
    case 3:
      return setHora(aux,10,00,00)
    case 4:
      return setHora(aux,10,30,00)
    case 5:
      return setHora(aux,12,00,00)
    case 6:
      return setHora(aux,13,30,00)
    case 7:
      return setHora(aux,15,00,00)
    case 8:
      return setHora(aux,16,30,00)
    case 9:
      return setHora(aux,18,00,00)
    case 10:
      return setHora(aux,18,30,00)
    case 11:
      return setHora(aux,20,00,00)
    default:
      return setHora(aux,00,00,00)
 }
}

function addTimerReserva(time)
{ 
  
  console.log('reserva time ',time.format('dddd MMMM YYYY H:mm:ss'));
  global.timersReserva.push(time.clone());
  global.timersReserva.sort();
  printTimersReservas()
  index.timerReserva(1)
}

function setTimersReservas() {

  var inicio=nextTimer(momento.momento(),1);
  global.timersReserva.push(inicio);
  var id =getHoraID(inicio);
  for (let i=id,x=0; i<11; i++,x++) {
    
    var aux=nextTimer(global.timersReserva[x],1);
    global.timersReserva.push(aux);
 
  }
  printTimersReservas();
}
function printTimersReservas()
{
  for (let i = 0; i < global.timersReserva.length; i++) {
    const element = global.timersReserva[i];
    console.log(element.format('dddd DD MMMM YYYY H:mm:ss'))
    
  }
}
module.exports.nextTimer=nextTimer;
module.exports.compareDate=compareDate;
module.exports.getHoraID=getHoraID;
module.exports.setHora=setHora;
module.exports.getDateFromID=getDateFromID;
module.exports.addTimerReserva=addTimerReserva;
module.exports.setTimersReservas=setTimersReservas;