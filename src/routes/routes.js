const express = require('express');
const router = express.Router();
const mysqlConnection = require('../database.js');
const helpers = require('./helpers');
const utils = require('../utils.js');
const momento = require('../momento.js');
const updateSocket = require('../sendUpdateSockets.js');
const peticiones = require('../peticiones.js');
const index = require('../index.js');
const moment = require('moment');
// GET

router.get('/', async (req, res) => {
  var labs = await peticiones.getLabsInfo()
  res.json(labs);
});




router.put('/modifyComputadora/:id', (req, res) => {

  const { id } = req.params;

  const { lab, edo } = req.body;
  mysqlConnection.query('update Computadora set estado = ? where idComputadora=? and idLaboratorio=?', [edo, id, lab], (err, rows, fields) => {
    if (!err) {
      updateSocket.sendUpdateComputadoras(lab)
      res.json({ status: "Computadora modificada" });
    } else {
      console.log(err);
      res.json({ error: "ups hubo algun error :(" });
    }
  });
});

router.put('/modifyLaboratorio/:id', (req, res) => {

  const { id } = req.params;

  const { edo } = req.body;
  mysqlConnection.query('update Laboratorio set estado = ? where idLaboratorio=?', [edo, id], (err, rows, fields) => {
    if (!err) {
      res.json({ status: "Laboratorio modificado" });
    } else {
      console.log(err);
      res.json({ error: "ups hubo algun error :(" });
    }
  });
});
/*
// DELETE An Employee
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  console.log('hola id');
  
  mysqlConnection.query('DELETE FROM employee WHERE id = ?', [id], (err, rows, fields) => {
    if(!err) {
      res.json({status: 'Employee Deleted'});
    } else {
      console.log(err);
      
    }
  });
});
*/
// INSERT An Employee
//1 alumno
//2 docente
//3 adminsitrador
router.post('/add/alumno', async (req, res) => {
  console.log(" add alumno");
  const { id, correo, password } = req.body;

  var finalpass = await helpers.encryptPassword(password);

  const query = "select correo from Usuario where correo=?";
  const query2 = "select id from Usuario where id=?";
  const query3 = "insert into  Usuario (id,correo,tipoUsuario,password) values (?,?,?,?)";

  mysqlConnection.query(query, [correo], (err, rows, fields) => {
    if (rows.length > 0) {
      console.log("El correo ya esta en registrado");
      res.json({ error: "El correo ya esta en registrado" });
    } else if (!err) {

      mysqlConnection.query(query2, [id], (err2, rows2, fields2) => {
        if (rows2.length > 0) {
          console.log("la boleta ya  esta en registrada");
          res.json({ error: "la boleta ya  esta registrada" });
        } else if (!err2) {

          mysqlConnection.query(query3, [id, correo, 1, finalpass], (err3, rows3, fields3) => {
            if (!err3) {
              console.log("Usuario guardado");
              res.json({ status: "Usuario guardado" });
            } else {
              console.log(err3);
              res.json({ error: "ups hubo algun error :(" });
            }
          });

        } else {
          console.log(err2);
          res.json({ error: err2 });
        }
      });
    } else {
      console.log(err);
      res.json({ error: err });
    }
  });


});

router.post('/login', async (req, res) => {
  const { id, password } = req.body;
  console.log('login');

  mysqlConnection.query('SELECT password FROM Usuario where id=?', [id, password], async (err, rows, fields) => {
    if (rows.length < 1) {
      res.json({ error: "Usuario o Contraseña incorrecta" });
    } if (!err) {
      //console.log('rows',rows[0]['password'])
      const validPass = await helpers.matchPassword(password, rows[0]['password']);
      if (validPass)
        res.json({ status: "ok" });
      else
        res.json({ error: "Usuario o Contraseña incorrecta" });
    } else {
      console.log(err);
      res.json({ error: "ups hubo algun error :(" });
    }
  });
});
/*
router.put('/modifyAlumno/:id', (req, res) => {
  const { name, salary } = req.body;
  const { id } = req.params;
  const query ="update  Usuario where nombre=?,apellido=?,correo=?,?"
  mysqlConnection.query(query, [id, name, salary], (err, rows, fields) => {
    if(!err) {
      res.json({status: "Usuario guardado"});
    } else {
      console.log(err);
    }
  });
});*/

router.put('/modifyToken/:id', (req, res) => {
  const { token } = req.body;
  const { id } = req.params;
  const query = "update  TokenNotification set idToken=? where usuario=?"
  mysqlConnection.query(query, [token, id], (err, rows, fields) => {
    if (!err) {
      res.json({ status: "Token actualizado" });
    } else {
      console.log(err);
    }
  });
});


router.post('/reservaComputadora', async (req, res) => {


  const { usuario, compu, lab, hora } = req.body;
  var edo = "En espera"
  //const query ="insert into ReservaComputadora() values(?,?,?,?,?,?,?,?)"
  const query = "INSERT INTO ReservaComputadora () SELECT * FROM (SELECT ?,? AS idComputadora,?,?,? AS dia,? As hora,?,?) AS tmp WHERE NOT EXISTS ( SELECT * FROM ReservaComputadora WHERE idComputadora = ? and idLaboratorio=? and dia=? and hora=? and estado=?) LIMIT 1;"
  var inicio = momento.momento();
  var formato = 'YYYY-MM-DD HH:mm:ss';
  var dia = momento.momento().day()
  var type;
  if (utils.compareDate(inicio, utils.getDateFromID(hora)) == inicio) {
    var fin = inicio.clone().add(global.reservaTime, global.reservaTimeType);
    type = 1;
  } else {
    var fin = utils.getDateFromID(hora).add(global.reservaTime, global.reservaTimeType);
    type = 2;
  }
  mysqlConnection.query(query, [usuario, compu, lab, inicio.format(formato), dia, hora, fin.format(formato), edo, compu, lab, dia, hora, edo], (err, rows, fields) => {
    if (!err) {
      if (rows['affectedRows'] == 1) {
        res.json({ message: "Reserva hecha",status:0 });
        reservaContinue(type, hora, compu, lab, fin)
      }
      else
        res.json({ message: "Computadora no disponible",status:1});

    } else {
      console.log(err);
      res.json({ message: "Ups hubo un error",status:2 });
    }
  });
});

async function reservaContinue(type, hora, compu, lab, fin) {
  if (type == 1) {
    console.log('type',type)
    utils.addTimerReserva(fin)
    await peticiones.modCompu(compu, lab, 'Reservada')
    updateSocket.sendUpdateLabs();
    updateSocket.sendUpdateComputadoras(lab);

  } else
  {
    console.log('type',type)
    updateSocket.sendUpdateComputadorasFuture(lab, hora);
  }
    

}

router.post('/hora', async (req, res) => {
  const { fecha, hora } = req.body;//2020-05-19T12:09:00
  console.log('/hora');
  if (req.body == null || fecha == null || hora == null)
    momento.setFecha(null);
  else
    momento.setFecha(moment(fecha + 'T' + hora));
  index.setHoraRoute();
  res.json({ fecha: momento.momento().format('YYYY-MM-DTHH:mm:ss.SSS') });
});

module.exports = router;
