
const express = require('express');
const router = express.Router();
const reportes=require('../reporte.js') 
router.get('/views/home', (req, res) => {
  res.render('home');
});

router.get('/views/my', (req, res) => {
  res.render('sok');
});


router.get('/views/reporteComputadora', async (req, res) => {
  //const { lab, dia } = req.body;
  let lab = 1105; let dia = '2020-06-05'
  let ruta = await reportes.getReporteComputadora(lab, dia);
  res.sendFile(ruta['filename'])
});

router.post('/views/reporteLaboratorio', async (req, res) => {
  const { lab, dia } = req.body;
  let ruta = await reportes.getReporteLaboratorio(lab, dia);
  res.sendFile(ruta['filename'])
});


module.exports = router;