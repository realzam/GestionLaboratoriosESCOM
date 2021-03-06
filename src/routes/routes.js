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
const jwt = require('jsonwebtoken');
const correo = require('../correo.js');
const { verificaToken } = require('../middlewares/autenticacion');
// GET

router.get('/', async (req, res) => {
  console.log('/route raiz')
  var labs = await peticiones.Labs();
  res.json(labs);
});

router.get('/redirect', async (req, res) => {
  console.log('/redirect')
  var ua = req.headers['user-agent'].toLowerCase();
  if (/mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile|ipad|android|android 3.0|xoom|sch-i800|playbook|tablet|kindle/i.test(ua)) {
    console.log('tengo que redireccionar')
  } else {
    console.log('tengo que mostarr pagina')
  }
  res.redirect('controlescom://recovery?uid=123&token=abc');
});

router.get('/obtenerDatos', (req, res) => {
  console.log('/route raiz')
  mysqlConnection.query(' select * from Horario where idHorario=? and dia=?', [1105, 3,], (err, rows, fields) => {
    if (!err) {
      res.render('datos', { data: rows });
    } else {
      res.json({ error: "ups hubo algun error :(" });
    }
  });
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
router.post('/add/usuario/:type', async (req, res) => {
  const { type } = req.params;
  console.log(" add alumno");
  const { id, correo, password, nombre, lab } = req.body;
  var labf = lab
  if (type < 1 || type > 3) {
    res.json({ error: "tipo no valido" });
    return 0;
  }

  if (type == 3 && (labf == null || global.labslist.indexOf(labf) == -1))//global.labslist
  {
    res.json({ error: "laboratorio no valido" });
    return 0;
  }
  else if (type == 1 || type == 2) {
    labf = null
  }
  var finalpass = await helpers.encryptPassword(password);
  const query = "select correo from Usuario where correo=?";
  const query2 = "select id from Usuario where id=?";
  const query3 = "insert into  Usuario () values (?,?,?,?,?,?)";
  mysqlConnection.query(query, [correo], (err, rows, fields) => {
    if (rows.length > 0) {
      console.log("El correo ya esta en registrado");
      res.json({ error: "El correo ya esta en registrado" });
      return 0;
    } else if (!err) {
      mysqlConnection.query(query2, [id], (err2, rows2, fields2) => {
        if (rows2.length > 0) {
          console.log("el usuario ya  estaba registrado");
          res.json({ error: "el usuario ya  estaba registrado" });
          return 0;
        } else if (!err2) {

          mysqlConnection.query(query3, [id, nombre, correo, type, finalpass, labf], (err3, rows3, fields3) => {
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
          res.json({ error: 'ups hubo algun error :(' });
        }
      });
    } else {
      console.log(err);
      res.json({ error: 'ups hubo algun error :(' });
    }
  });
});

router.post('/login', async (req, res) => {
  const { id, password } = req.body;
  console.log('login');
  mysqlConnection.query('SELECT password,tipoUsuario,laboratorio,correo FROM Usuario where id=?', [id, password], async (err, rows, fields) => {
    if (rows.length < 1) {
      res.json({ error: "Usuario o Contraseña incorrecta" });
    } if (!err) {
      //console.log('rows',rows[0]['password'])
      const validPass = await helpers.matchPassword(password, rows[0]['password']);
      if (validPass)
        res.json({ status: "ok", type: rows[0]['tipoUsuario'], lab: (rows[0]['tipoUsuario'] == 3) ? rows[0]['laboratorio'] : '', correo: rows[0]['correo'] });
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
  if (hora < utils.getHoraID(momento.momento()) || hora < 1 || hora > 11 || hora == null) {
    res.json({ message: "Hora invalida", status: 2 });
    return 0;
  }
  var edo = "En espera"
  //const query ="insert into ReservaComputadora() values(?,?,?,?,?,?,?,?)"
  const query = "INSERT INTO ReservaComputadora () SELECT * FROM (SELECT ?,? AS idComputadora,?,?,? AS dia,? As hora,?,?,?) AS tmp WHERE NOT EXISTS ( SELECT * FROM ReservaComputadora WHERE idComputadora = ? and idLaboratorio=? and dia=? and hora=? and estado=?) LIMIT 1;"
  var inicio = momento.momento();
  var formato = 'YYYY-MM-DD HH:mm:ss';
  var dia = momento.momento().day()
  var type;
  if (utils.compareDate(inicio, utils.getDateFromID(hora)) == inicio) {//now
    var fin = inicio.clone().add(global.reservaTime, global.reservaTimeType);
    type = 1;
  } else {//futuro
    var fin = utils.getDateFromID(hora).add(global.reservaTime, global.reservaTimeType);
    type = 2;
  }
  var resp = await peticiones.miReserva(usuario);
  if (resp.length > 0) {
    res.json({ message: "Ya tienes un reserva", status: 2 });
    return 0
  }
  var after = await peticiones.getComputadorasReservadas(lab, hora);
  if (after.length > 0) {
    for (var i = 0; i < after.length; i++) {
      var element = after[i]
      if (element['idComputadora'] = compu) {
        res.json({ message: "Computadora  no esta diponible", status: 2 });
        return 0;
      }
    }

  }
  mysqlConnection.query(query, [usuario, compu, lab, inicio.format(formato), dia, hora, fin.format(formato), edo, 'Sin observaciones', compu, lab, dia, hora, edo], async (err, rows, fields) => {
    if (!err) {
      if (rows['affectedRows'] == 1) {
        if (type == 1)
          await peticiones.modCompu(compu, lab, 'Reservada');
        reservaContinue(type, hora, lab, fin, usuario, 1)
        res.json({ message: "Reserva hecha", status: 0, type: type });
      }
      else
        res.json({ message: "Computadora no disponible", status: 1 });

    } else {
      console.log(err);
      res.json({ message: "Ups hubo un error", status: 2 });
    }
  });
});

function canelatReservaUsuario(usuario) {
  return new Promise(resolve => {
    const query = "update  ReservaComputadora set estado='Cancelada' where idUsuario=? and estado='En espera'";
    mysqlConnection.query(query, [usuario], async (err, rows, fields) => {
      if (!err) {
        updateSocket.sendUpdateReserva(usuario);
        resolve(true)
      } else {
        console.log(err);
        resolve(false)
      }
    });
  });
}

const canelarReserva = async (reservas) => {
  for (var i = 0; i < reservas.length; i++) {
    await canelatReservaUsuario(reservas[0].idUsuario)
  }
  return new Promise(resolve => resolve(1));
}

router.post('/reservaLaboratorio', async (req, res) => {
  const { usuario, lab, hora } = req.body;
  var edo = "En espera"
  //const query ="insert into ReservaComputadora() values(?,?,?,?,?,?,?,?)"
  const query = "INSERT INTO ReservaLaboratorio () SELECT * FROM (SELECT ?,?,?,? AS dia,? As hora,?,?,?) AS tmp WHERE NOT EXISTS ( SELECT * FROM ReservaComputadora WHERE idLaboratorio=? and dia=? and hora=? and estado=?) LIMIT 1;"
  var inicio = momento.momento();
  var formato = 'YYYY-MM-DD HH:mm:ss';
  var dia = momento.momento().day()
  var type;
  if (hora < utils.getHoraID(momento.momento()) || hora < 1 || hora > 11 || hora == null) {
    res.json({ message: "Hora invalida", status: 2 });
    return 0;
  }
  if (utils.compareDate(inicio, utils.getDateFromID(hora)) == inicio) {
    var fin = inicio.clone().add(global.reservaTime, global.reservaTimeType);
    type = 1;
  } else {
    var fin = utils.getDateFromID(hora).add(global.reservaTime, global.reservaTimeType);
    type = 2;
  }
  var resp = await peticiones.miReserva2(usuario);
  if (resp.length > 0) {
    res.json({ message: "Ya tienes un reserva", status: 2 });
    return 0
  }
  var after = await peticiones.getLaboratorioReservado(lab, hora);
  if (after.length > 0) {
    res.json({ message: "El laboratorio ya no est diponible", status: 2 });
    return 0
  }
  var reservasCancel = await peticiones.getComputadorasReservadas(lab, hora)
  await canelarReserva(reservasCancel);
  mysqlConnection.query(query, [usuario, lab, inicio.format(formato), dia, hora, fin.format(formato), edo, 'Sin observaciones', lab, dia, hora, edo], async (err, rows, fields) => {
    if (!err) {
      if (rows['affectedRows'] > 0) {
        console.log('affectedRows', rows['affectedRows'])
        if (type == 1) {
          peticiones.modEdoLab(lab, 'Reservado')
          await peticiones.setComputadorasEdo('Ocupada', lab);
        }
        reservaContinue(type, hora, lab, fin, usuario, 2)
        res.json({ message: "Reserva hecha", status: 0, type: type });
      }
      else
        res.json({ message: "El laboratorio ya no est diponible", status: 1 });

    } else {
      console.log(err);
      res.json({ message: "Ups hubo un error", status: 2 });
    }
  });
});


function reservaContinue(type, hora, lab, fin, usuario, who) {
  if (type == 1) {
    utils.addTimerReserva(fin);
    updateSocket.sendUpdateComputadoras(lab);
    updateSocket.sendUpdateLabs();
  } else {
    updateSocket.sendUpdateComputadorasFuture(lab, hora);
  }
  updateSocket.sendUpdateReserva(usuario);
  updateSocket.sendUpdateReservaAdmin(lab, who);
  updateSocket.sendUpdateReservaReportes(lab, who);
}

router.put('/cancelarReserva/computadora/:usuario', async (req, res) => {
  const { usuario } = req.params;
  const query = "update  ReservaComputadora set estado='Cancelada' where idUsuario=? and estado='En espera'";
  var resp = await peticiones.miReserva(usuario);
  var lab;
  var hora;
  if (resp.length > 0) {
    lab = resp[0]['id_laboratorio'];
    hora = resp[0]['hora'];
    compu = resp[0]['id_computadora'];
  }
  else {
    res.json({ status: "No tienes reserva" });
    return 0;
  }
  mysqlConnection.query(query, [usuario], async (err, rows, fields) => {
    if (!err) {
      if (utils.getHoraID(momento.momento()) == hora) {
        await peticiones.modCompu(compu, lab, 'Disponible')
        updateSocket.sendUpdateComputadoras(lab);
        updateSocket.sendUpdateLabs();
      } else
        updateSocket.sendUpdateComputadorasFuture(lab, hora);

      updateSocket.sendUpdateReserva(usuario);
      updateSocket.sendUpdateReservaAdmin(lab, 1);
      updateSocket.sendUpdateReservaReportes(lab, 1);
      res.json({ status: "Reserva cancelada" });
    } else {
      console.log(err);
    }
  });
});

router.put('/cancelarReserva/laboratorio/:usuario', async (req, res) => {
  const { usuario } = req.params;
  const query = "update  ReservaLaboratorio set estado='Cancelada' where idUsuario=? and estado='En espera'";
  var resp = await peticiones.miReserva2(usuario);
  var lab;
  var hora;
  if (resp.length > 0) {
    lab = resp[0]['id_laboratorio'];
    hora = resp[0]['hora'];
  }
  else {
    res.json({ status: "No tienes reserva" });
    return 0;
  }
  mysqlConnection.query(query, [usuario], async (err, rows, fields) => {
    if (!err) {
      if (utils.getHoraID(momento.momento()) == hora) {
        peticiones.modEdoLab(lab, 'Tiempo libre')
        await peticiones.setComputadorasEdo('Disponible', lab);
        updateSocket.sendUpdateComputadoras(lab);
        updateSocket.sendUpdateLabs();
      } else
        updateSocket.sendUpdateComputadorasFuture(lab, hora);

      updateSocket.sendUpdateReserva(usuario);
      updateSocket.sendUpdateReservaAdmin(lab, 2);
      updateSocket.sendUpdateReservaReportes(lab, 2);
      res.json({ status: "Reserva cancelada" });
    } else {
      console.log(err);
    }
  });
});

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


router.post('/tokenNotification', async (req, res) => {
  const { token, usuario } = req.body;//2020-05-19T12:09:00
  var query = 'INSERT INTO TokenNotification(idToken, usuario) SELECT * FROM (SELECT ? AS token, ? AS usuario) AS tmp WHERE NOT EXISTS (SELECT idToken FROM TokenNotification WHERE idToken = ? and usuario = ?) LIMIT 1';
  mysqlConnection.query(query, [token, usuario, token, usuario], async (err, rows, fields) => {
    if (!err) {
      res.json({ status: true });

    } else {
      console.log(err);
      res.json({ status: false });
    }
  });
});


router.put('/nextReserva', async (req, res) => {
  console.log('/nextReserva')
  const { usuario, tipoO, estado, hora, lab, computadora, tipoUsuario, observaciones } = req.body;
  var observacionesF = '';
  if (observaciones == null || observaciones == '') {
    observacionesF = 'Sin observaciones';
  }
  else
    observacionesF = observaciones;
  console.log('login');
  var sql;
  if (estado == "En espera" && utils.getHoraID(momento.momento())<hora) {
    res.json({ status: false, message: 'Aun no es tiempo' });
    return 0;
  }
  if (tipoO == 1)
    sql = "update  ReservaComputadora set estado=?, fin=? ,observaciones=? where idUsuario=? and estado=?";
  else
    sql = "update  ReservaLaboratorio set estado=?, fin=? ,observaciones=? where idUsuario=? and estado=?";
  var nextEdo;
  var fin;
  console.log('/nesxtEdon check if',estado,"En espera",estado == "En espera");
  if (estado == "En espera") {
    nextEdo = "En uso";
    var horas = await peticiones.getHorasLibres(lab, momento.momento().day())
    var init = -1
    var finH = hora;
    for (let i = 0; i < horas.length; i++) {
      const element = horas[i];
      if (init == -1) {
        if (element['hora'] == hora) {
          init = hora;
          continue;
        }
      } else {
        if (element['hora'] - init == 1) {
          init = element['hora'];
          continue;
        }
        finH = init
        break;
      }

    }
    fin = utils.getDateFromID(finH + 1).subtract(1, 'second');
    console.log('add tieer reserva en uso para finalizar a:',fin);
    utils.addTimerReserva(fin);
  }

  else if (estado == "En uso") {
    nextEdo = "Finalizada"
    fin = momento.momento()
  }
  var formato = 'YYYY-MM-DD HH:mm:ss';
  mysqlConnection.query(sql, [nextEdo, fin.format(formato), observacionesF, usuario, estado], async (err, rows, fields) => {
    if (rows['changedRows'] < 1) {
      res.json({ error: "Reserva no encontrada" });

    } if (!err) {
      var msg;
      if (nextEdo == 'Finalizada' && tipoO == 1) {
        await peticiones.modCompu(computadora, lab, 'Disponible')
        updateSocket.sendUpdateComputadoras(lab);
        updateSocket.sendUpdateLabs();
        msg = 'Reserva Finalizada'
      }

      else if (nextEdo == 'Finalizada' && tipoO == 2) {
        peticiones.modEdoLab(lab, 'Tiempo libre')
        await peticiones.setComputadorasEdo('Disponible', lab);
        updateSocket.sendUpdateComputadoras(lab);
        updateSocket.sendUpdateLabs();
        msg = 'Reserva Finalizada'
      }
      else
        msg = 'Reserva confirmada';
      await updateSocket.sendUpdateReserva(usuario);
      updateSocket.sendUpdateReservaAdmin(lab, tipoUsuario);
      updateSocket.sendUpdateReservaReportes(lab, tipoO);
      res.json({ status: true, message: msg });
    } else {
      console.log(err);
      res.json({ status: false, message: "ups hubo algun error :(" });
    }
  });
});


router.post('/passwordOlvidado', async (req, res) => {
  const { usuario } = req.body;
  var response = await emailExist(usuario);
  if (response.length == 0)
    return res.json({ message: 'El correo no existe' })

  const token = jwt.sign({ id: response[0]['id'] }, process.env.SEED, { expiresIn: 60*60*24 })
  var html = `
  <h2>Porfavor haz click en el sigiente enlace para recuperara tu cuenta</h2>
  <p>${process.env.CLIENT_URL}/views/recoveryPassword/${token}</p>
  `;
  var email = await correo.eviarCorreo(usuario, 'Recuperacion de contraseña', '', [], html)
  mysqlConnection.query('insert into tokenRecovery () values (?,?)', [response[0]['id'], token], (err, rows, fields) => {
    if (!err) {
      console.log('token agregado')
    }
    else {
      console.log('error al token agregado')
      console.log(err)
    }

  })
  res.json({ ok: true, token, email })
});



router.post('/passwordReset/:token', verificaToken, async (req, res) => {
  const { password, pwd } = req.body;
  var token = req.params;
  var ua = req.headers['user-agent'].toLowerCase();
  var ismobile = /mobile|iphone|ipod|android|blackberry|opera|mini|windows\sce|palm|smartphone|iemobile|ipad|android|android 3.0|xoom|sch-i800|playbook|tablet|kindle/i.test(ua)
  console.log('ismobile',ismobile);
  if (password != pwd) {
    if (ismobile) {
      return res.json({ ok: false, message: 'las nuevas contraseñas son diferentes' })
    } else {

      return res.render('recoverypass', { token, ok: false, message: 'las nuevas contraseñas son diferentes', paso: 2 })
    }
  }

  if (password.length < 8) {
    if (ismobile) {
      return res.json({ ok: false, message: 'La contraseña debe tener al menos 8 caracteres' })
    } else {
      return res.render('recoverypass', { token, ok: false, message: 'La contraseña debe tener al menos 8 caracteres', paso: 2 })
    }
  }

  var id = req.usuario
  var finalpass = await helpers.encryptPassword(password);
  var ua = req.headers['user-agent'].toLowerCase();

  mysqlConnection.query('update Usuario set password=? where id=?', [finalpass, id], async(err, rows, fields) => {
    if (!err) {
      await cleanToken(id);
      if (ismobile) {
        res.json({ ok: true, message: 'Contraseña cambiada' })
      } else {

        res.render('recoverypass', { token, ok: true, message: 'Contraseña cambiada', paso: 2 })
      }

    } else {
      console.log(err)
      res.json({ ok: false, message: 'hubo un error' })
    }
  })

});

const cleanToken = (id) => {
  return new Promise(resolve => {

    mysqlConnection.query('delete from  tokenRecovery where usuario=?', [id], (err, rows, fields) => {
      if (!err) {
        console.log('tokens eliminado')
        resolve(true)
      } else {
        console.log('error al tokens eliminado')
        console.log(err);
        resolve(false)

      }
    })
  })
}
const emailExist = (usuario) => {
  return new Promise(resolve => {
    const query = "select * from Usuario where correo=? limit 1";
    console.log('emailExist');
    mysqlConnection.query(query, [usuario], (err, rows, fields) => {
      if (!err) {
        resolve(rows);
      }
      else {
        console.log(err)
        resolve([])
      }
    });
  })
}




router.post('/horario', async (req, res) => {
  console.log('/horario')
  var { lab, dia, hora, clase } = req.body;
  var params = [];

  var respnse = {};
  var sql = 'select h.idHorario,h.dia,h.hora,hr.inicio,hr.fin,h.clase from Horario h,Hora hr where ';
  if (lab != null) {
    sql = sql + 'idHorario=?';
    params.push(lab);
  } else {
    sql = sql + '1=1';
  }
  if (dia == 6 || dia == 0) {
    dia = 1;
    sql = sql + ' and dia=?';
    params.push(dia);
  } else if (dia >= 1 && dia <= 5) {
    sql = sql + ' and dia=?';
    params.push(dia);
  }

  if (hora == 0 || hora == -1) {
    hora = utils.getHoraID(momento.momento());
    if (hora == 0 || hora == -1)
      hora = 1;
    sql = sql + ' and hora=?';
    params.push(hora);
  }
  else if (hora >= 1 && hora <= 11) {
    sql = sql + ' and hora=?';
    params.push(hora);
  }

  if (clase != null) {
    sql = sql + ' and clase=?';
    params.push(clase);
  }
  sql = sql + ' and hr.idHora=h.hora order by h.idHorario,h.dia,h.hora';
  var resp = await horario(sql, params);
  if (!resp['ok'] || resp['info'].length == 0) {
    res.json(resp)
    return 0;
  }
  else {
    respnse['ok'] = true;
    var claseO = {};
    var claseList = [];
    var diaList = [];
    var diaO = {};
    var diaAux = resp['info'][0]['dia'];
    var labList = [];
    var labO = {};
    var labAux = resp['info'][0]['idHorario'];
    for (let i = 0; i < resp['info'].length; i++) {
      var element = resp['info'][i];
      if (resp['info'].length == 1 || i == resp['info'].length - 1) {
        claseO['clase'] = element['clase'];
        claseO['hora'] = element['hora'];
        claseO['inicio'] = element['inicio'];
        claseO['fin'] = element['fin'];
        claseList.push(Object.assign({}, claseO))
      }

      if (diaAux != element['dia'] || labAux != element['idHorario'] || i == resp['info'].length - 1) {
        diaO['dia'] = diaAux;
        diaO['clases'] = claseList;
        diaList.push(Object.assign({}, diaO))
        claseList = [];
        diaAux = element['dia']
      }
      if (labAux != element['idHorario'] || i == resp['info'].length - 1) {
        labO['id_laboratorio'] = labAux;
        labO['dias'] = diaList;
        diaList = [];
        labList.push(Object.assign({}, labO))
        labAux = element['idHorario'];
      }
      claseO['clase'] = element['clase'];
      claseO['hora'] = element['hora'];
      claseO['inicio'] = element['inicio'];
      claseO['fin'] = element['fin'];
      claseList.push(Object.assign({}, claseO))
    }
    respnse['lab'] = labList;
    //console.log('respnse',respnse);

    res.json(respnse);
  }
});

function horario(sql, params) {
  return new Promise(function (resolve, reject) {
    mysqlConnection.query(sql, params, (err, rows, fields) => {
      if (!err) {
        resolve({ ok: true, info: rows })
      }
      else {
        console.log(err)
        resolve({ ok: false, info: "hay un error" })
      }
    });
  });
}

module.exports = router;
