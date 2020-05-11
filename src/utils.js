const moment = require('moment');
const index = require('./index.js');
const momento= require('./momento.js');
function nextTimer(hoy)
{
  var aux=hoy.clone()
 if(hoy.day()==6||hoy.day()==0)
 {
  var next=aux.add(( (hoy.day()/6) +1),'day');
  var after=setHora(next,7,0,0);
  return after;
 }
 else{
  var id=getHoraID(hoy)
  if(id==0)
    return setHora(aux.add(1,'day'),7,00,0)
  return getDateFromID(id+1)
 }
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
  var aux;
  var rr;
  for (let i = 1; i <=12; i++) {
    aux=getDateFromID(i).subtract(1,'second');
    rr=compareDate(hoy,aux)
    if(rr==aux)
      return i-1;   
  }
  return 0;
 /* 
  var aux=hoy.clone()
  aux=setHora(aux,6,59,59);
  if(compareDate(hoy,aux)==aux)
      return 0;
   aux=setHora(aux,8,29,59)
   if(compareDate(hoy,aux)==aux)
      return 1;
   aux=setHora(aux,9,59,59)
   if(compareDate(hoy,aux)==aux)
      return 2;
   aux=setHora(aux,10,29,59)
   if(compareDate(hoy,aux)==aux)
     return 3;
   aux=setHora(aux,11,59,59)
   if(compareDate(hoy,aux)==aux)
       return 4;
   aux=setHora(aux,13,29,59)
   if(compareDate(hoy,aux)==aux)
     return 5;
   aux=setHora(aux,14,59,59)
   if(compareDate(hoy,aux)==aux)
      return 6;
   aux=setHora(aux,16,29,59)
   if(compareDate(hoy,aux)==aux)
     return 7;
   aux=setHora(aux,17,59,59)
   if(compareDate(hoy,aux)==aux)
     return 8;
   aux=setHora(aux,18,29,59)
   if(compareDate(hoy,aux)==aux)
     return 9;
   aux=setHora(aux,19,59,59)
   if(compareDate(hoy,aux)==aux)
     return 10;
     aux=setHora(aux,21,29,59)
     if(compareDate(hoy,aux)==aux)
     return 11;
 return 0;*/
}

function setHora(date,h,m,s)
{
  var sh=h.toString()
  var sm=m.toString()
  var ss=s.toString();
  if(h<=9)
    sh='0'+sh;
  if(m<=9)
    sm='0'+sm;
  if(s<=9)
    ss='0'+ss;
    var res=moment(date.format('YYYY-MM-DD')+'T'+sh+':'+sm+':'+ss);
   // console.log('set hora',res)
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
    case 12:
      return setHora(aux,21,30,00)
    default:
      return setHora(aux,00,00,00)
 }
}

function setTimers(time)
{ 
  
  console.log('reserva time ',time.format('dddd MMMM YYYY H:mm:ss'));
  global.timersReserva.push(time.clone());
  global.timersReserva.sort();
  index.timerReserva(1)
}

module.exports.nextTimer=nextTimer;
module.exports.compareDate=compareDate;
module.exports.getHoraID=getHoraID;
module.exports.setHora=setHora;
module.exports.getDateFromID=getDateFromID;
module.exports.setTimers=setTimers;