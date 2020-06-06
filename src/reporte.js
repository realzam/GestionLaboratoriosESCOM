//Required package
var pdf = require("pdf-creator-node")
var fs = require('fs')
const mysqlConnection = require('./database.js');
const path = require('path');

var options = { height: "11.7in",width: "16.5in", orientation: "portrait", border: "10mm" };

function getReporteComputadoraInfo(lab, fecha) {
  return new Promise(async function (resolve, reject) {
    mysqlConnection.query('SELECT ReservaComputadora.idUsuario, ReservaComputadora.idComputadora as Computadora, DATE_FORMAT(ReservaComputadora.fin,"%d-%m-%Y") as dia, DATE_FORMAT(ReservaComputadora.fin,"%H:%i") as hora, ReservaComputadora.estado as Estado, ReservaComputadora.observaciones as observacion,Usuario.nombre as Nombre from ReservaComputadora left JOIN Usuario on ReservaComputadora.idUsuario=Usuario.id where ReservaComputadora.idLaboratorio=? and ReservaComputadora.fin>=?', [lab, fecha], (err, rows, fields) => {
      if (!err) {
        resolve(rows);
      } else {
        console.log(err);
        reject(err)
      }
    });
  });
}

async function getReporteComputadora(lab, fecha) {
  return new Promise(async function (resolve, reject) {
    var reservas = []
    let res = await getReporteComputadoraInfo(lab, fecha);
    for (const item of res) {
      reservas.push(item)
    }
    var html = fs.readFileSync(path.join(__dirname, 'views') + '/reporteC.html', 'utf8')
    var archivo = path.join(__dirname, 'public', 'reportes','computadoras') + "/Reporte-Laboratorio-" + lab + "-compuadoras.pdf"
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
        //console.log(res)
        resolve(res)
      })
      .catch(error => {
        console.error(error)
      });
  });

}


function getReporteLaboratorioInfo(lab, fecha) {
  return new Promise(async function (resolve, reject) {
    mysqlConnection.query('SELECT ReservaLaboratorio.idUsuario, DATE_FORMAT(ReservaLaboratorio.fin,"%d-%m-%Y") as dia, DATE_FORMAT(ReservaLaboratorio.fin,"%H:%i") as hora, ReservaLaboratorio.estado as Estado, ReservaLaboratorio.observaciones as observacion,Usuario.nombre as Nombre from ReservaLaboratorio left JOIN Usuario on ReservaLaboratorio.idUsuario=Usuario.id where ReservaLaboratorio.idLaboratorio=? and ReservaLaboratorio.fin>=?', [lab, fecha], (err, rows, fields) => {
      if (!err) {
        console.log('rows',rows)
        resolve(rows);
      } else {
        console.log(err);
        reject(err)
      }
    });
  });
}

function getReporteLaboratorio(lab, fecha) {
  var reservas = []
  return new Promise(async function (resolve, reject) {

    let res = await getReporteLaboratorioInfo(lab, fecha);
    for (const item of res) {
      reservas.push(item)
    }
    var html = fs.readFileSync(path.join(__dirname, 'views') +'/reporteL.html', 'utf8')
    var archivo = path.join(__dirname, 'public', 'reportes','laboratorios') +"/Reporte-Laboratorio-" + lab + ".pdf"
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
        resolve(res)
      })
      .catch(error => {
        console.error(error)
      });
  });

}

module.exports.getReporteComputadora = getReporteComputadora;
module.exports.getReporteLaboratorio = getReporteLaboratorio;