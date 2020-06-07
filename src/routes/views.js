
const express = require('express');
const router = express.Router();
const reportes = require('../reporte.js')
const utils = require('../utils.js');
const momento = require('../momento.js');
const correo = require('../correo.js');
router.get('/views/home', (req, res) => {
  res.render('home');
});



router.post('/views/generarReporte', async (req, res) => {
  const { lab, opc, tipo } = req.body;
  var inicio = '';
  var fin = '';
  var a = momento.momento();
  if (opc == 1)//dia
  {
    inicio = utils.setHora(a, 0, 0, 0).format('YYYY-MM-DD');
    fin = utils.setHora(a, 23, 59, 59).format('YYYY-MM-DD');
  } else if (opc == 2)//semana
  {
    var b = a.clone().day(1)
    inicio = utils.setHora(b, 0, 0, 0).format('YYYY-MM-DD');
    var c = a.clone().day(5)
    fin = utils.setHora(c, 23, 59, 59).format('YYYY-MM-DD');
  } else//mes
  {
    var b = a.clone().date(1);
    if (a.clone().date(31).month() == a.clone().month())
      var c = a.clone().date(31);
    else if (a.clone().date(30).month() == a.clone().month())
      var c = a.clone().date(30);
    else if (a.clone().date(29).month() == a.clone().month())
      var c = a.clone().date(29);
    else if (a.clone().date(28).month() == a.clone().month())
      var c = a.clone().date(28);

    inicio = utils.setHora(b, 0, 0, 0).format('YYYY-MM-DD');
    fin = utils.setHora(c, 23, 59, 59).format('YYYY-MM-DD');
  }
  if (tipo == 1)
    var ruta = await reportes.getReporteComputadora(lab, inicio, fin, opc);
  else
    var ruta = await reportes.getReporteLaboratorio(lab, inicio, fin, opc);
  res.sendFile(ruta['path'])
});


router.post('/views/enviarPDF', async (req, res) => {

  const { lab, opc, to,tipo } = req.body;
  var inicio = '';
  var fin = '';
  var a = momento.momento();
  if (opc == 1)//dia
  {
    inicio = utils.setHora(a, 0, 0, 0).format('YYYY-MM-DD');
    fin = utils.setHora(a, 23, 59, 59).format('YYYY-MM-DD');
  } else if (opc == 2)//semana
  {
    var b = a.clone().day(1)
    inicio = utils.setHora(b, 0, 0, 0).format('YYYY-MM-DD');
    var c = a.clone().day(5)
    fin = utils.setHora(c, 23, 59, 59).format('YYYY-MM-DD');
  } else//mes
  {
    var b = a.clone().date(1);
    if (a.clone().date(31).month() == a.clone().month())
      var c = a.clone().date(31);
    else if (a.clone().date(30).month() == a.clone().month())
      var c = a.clone().date(30);
    else if (a.clone().date(29).month() == a.clone().month())
      var c = a.clone().date(29);
    else if (a.clone().date(28).month() == a.clone().month())
      var c = a.clone().date(28);

    inicio = utils.setHora(b, 0, 0, 0).format('YYYY-MM-DD');
    fin = utils.setHora(c, 23, 59, 59).format('YYYY-MM-DD');
  }
  console.log('paso 1')
  if (tipo == 1)
    var ruta = await reportes.getReporteComputadora(lab, inicio, fin, opc);
  else
    var ruta = await reportes.getReporteLaboratorio(lab, inicio, fin, opc);
    console.log('paso 2')
  let subject = 'Reporte del laboratorio ' + lab;
  let text = 'Funciona'
  let attachments = [
    { filename: ruta['name'], path: ruta['path'] }
  ]

  var message = await correo.eviarCorreo(to, subject, text, attachments)
  res.json( message )
})

module.exports = router;