//Required package
var pdf = require("pdf-creator-node")
var fs = require('fs')

const path = require('path');
const peticiones = require('./peticiones.js');
var options = { height: "11.7in",width: "16.5in", orientation: "portrait", border: "10mm" };



async function getReporteComputadora(lab,  inicio,fin,tipo) {
  return new Promise(async function (resolve, reject) {
    var reservas = []
    let res = await peticiones.getReporteComputadoraInfo(lab,  inicio,fin);
    for (const item of res) {
      reservas.push(item)
    }
    var html = fs.readFileSync(path.join(__dirname, 'views') + '/reporteC.html', 'utf8')
    var archivo = path.join(__dirname, 'public', 'reportes','computadoras') + "/Reporte-Laboratorio-" + lab + "-compuadoras-"+tipo+".pdf"
    var name="Reporte-Laboratorio-" + lab + "-compuadoras-"+tipo+".pdf"
    var document = {
      html: html,
      data: {
        reservas: reservas,
        lab: lab
      },
      path: archivo
    };
    pdf.create(document, options)
      .then(res => {
        res['name']=name
        res['path'] = res['filename'];
        resolve(res)
      })
      .catch(error => {
        console.error(error)
      });
  });

}




function getReporteLaboratorio(lab, inicio,fin,tipo) {
  var reservas = []
  return new Promise(async function (resolve, reject) {

    let res = await peticiones.getReporteLaboratorioInfo(lab, inicio,fin);
    for (const item of res) {
      reservas.push(item)
    }
    var html = fs.readFileSync(path.join(__dirname, 'views') +'/reporteL.html', 'utf8')
    var archivo = path.join(__dirname, 'public', 'reportes','laboratorios') +"/Reporte-Laboratorio-" + lab +"-"+tipo+".pdf"
    var name="Reporte-Laboratorio-" + lab +"-"+tipo+".pdf"
    var document = {
      html: html,
      data: {
        reservas: reservas,
        lab: lab
      },
      path: archivo
    };
    pdf.create(document, options)
      .then(res => {
        res['name']=name
        res['path'] = res['filename'];
        resolve(res)
      })
      .catch(error => {
        console.error(error)
      });
  });

}

module.exports.getReporteComputadora = getReporteComputadora;
module.exports.getReporteLaboratorio = getReporteLaboratorio;