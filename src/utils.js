const moment = require('moment');

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
   aux=setHora(hoy.clone(),6,59,59);
   if(compareDate(hoy,aux)!=hoy)
       return aux;
    aux=setHora(aux,8,29,59)
    if(compareDate(hoy,aux)!=hoy)
       return aux;
    aux=setHora(aux,9,59,59)
    if(compareDate(hoy,aux)!=hoy)
       return aux;
    aux=setHora(aux,10,29,59)
    if(compareDate(hoy,aux)!=hoy)
      return aux;
    aux=setHora(aux,11,59,59)
      if(compareDate(hoy,aux)!=hoy)
        return aux;
    aux=setHora(aux,13,29,59)
    if(compareDate(hoy,aux)!=hoy)
      return aux;
    aux=setHora(aux,14,59,59)
    if(compareDate(hoy,aux)!=hoy)
       return aux;
    aux=setHora(aux,16,29,59)
    if(compareDate(hoy,aux)!=hoy)
      return aux;
    aux=setHora(aux,17,59,59)
    if(compareDate(hoy,aux)!=hoy)
      return aux;
    aux=setHora(aux,18,29,59)
    if(compareDate(hoy,aux)!=hoy)
      return aux;
    aux=setHora(aux,19,59,59)
    if(compareDate(hoy,aux)!=hoy)
      return aux;
      aux=setHora(aux,21,29,59)
      if(compareDate(hoy,aux)!=hoy)
      return aux;
  return setHora(aux.add(1,'day'),6,59,59)
    
 }

}

function compareDate(d1,d2)
{//d1 hoy
  //d2 aux
if(d1.hours()>d2.hours())
{
  return d1;
}
else if(d1.hours()<d2.hours())
{
  return d2
}
if(d1.minutes()>d2.minutes())
{
  return d1;
}
else if(d1.minutes()<d2.minutes())
{
  return d2
}

if(d1.seconds()>d2.seconds())
{
  return d1;
}
else if(d1.seconds()<d2.seconds())
{
  return d2
}
return d1;
}

function getHoraID(hoy)
{
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
   if(compareDate(hoy,aux)!=hoy)
     return 9;
   aux=setHora(aux,19,59,59)
   if(compareDate(hoy,aux)!=hoy)
     return 10;
     aux=setHora(aux,21,29,59)
     if(compareDate(hoy,aux)!=hoy)
     return 11;
 return 0;
}

function setHora(date,h,m,s)
{
  var sh=h.toString()
  var sm=m.toString()
  var ss=s.toString();
  if(h<=9)
  {
    sh='0'+sh;
  }
  if(m<=9)
  {
    sm='0'+sm;
  }
  if(s<=9)
  {
    ss='0'+ss;
  }
  return moment(date.format('YYYY-MM-DD')+'T'+sh+':'+sm+':'+ss)
}

module.exports.nextTimer=nextTimer;
module.exports.compareDate=compareDate;
module.exports.getHoraID=getHoraID;
module.exports.setHora=setHora;