const express = require('express');
const router = express.Router();
const mysqlConnection  = require('../database.js');
const helpers=require('./helpers');
const path = require('path');

// GET all Employees
router.get('/', (req, res) => {
  console.log('ruta raiz');
  
  mysqlConnection.query('select l.idLaboratorio as id_laboratorio,l.estado ,count(*) as disponibles from Laboratorio l,Computadora c where c.idLaboratorio=l.idLaboratorio and c.estado="Disponible" group by l.idLaboratorio', (err, rows, fields) => {
    if(!err) {
      res.json(rows);
    } else {
      console.log(err);
    }
  });  
});


router.put('/modifyComputadora/:id', (req, res) => {

  const { id } = req.params;

  const {lab, edo} = req.body;
  mysqlConnection.query('update Computadora set estado = ? where idComputadora=? and idLaboratorio=?', [edo,id,lab], (err, rows, fields) => {
    if (!err) {
      res.json({status: "Computadora modificada"});
    } else {
      console.log(err);
      res.json({error: "ups hubo algun error :("});
    }
  });
});

router.put('/modifyLaboratorio/:id', (req, res) => {

  const { id } = req.params;

  const {edo} = req.body;
  mysqlConnection.query('update Laboratorio set estado = ? where idLaboratorio=?', [edo,id], (err, rows, fields) => {
    if (!err) {
      res.json({status: "Laboratorio modificado"});
    } else {
      console.log(err);
      res.json({error: "ups hubo algun error :("});
    }
  });
});

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

// INSERT An Employee
//1 alumno
//2 docente
//3 adminsitrador
router.post('/add/alumno', async (req, res) => {
  console.log(" add alumno");
  const {id, correo, password} = req.body;
  
  var finalpass= await helpers.encryptPassword(password);

  const query ="select correo from Usuario where correo=?";
  const query2 ="select id from Usuario where id=?";
  const query3 ="insert into  Usuario (id,correo,tipoUsuario,password) values (?,?,?,?)";
 
  mysqlConnection.query(query, [correo], (err, rows, fields) => {
    if(rows.length>0) {
      console.log("El correo ya esta en registrado");
      res.json({error: "El correo ya esta en registrado"});
    } else if(!err){

      mysqlConnection.query(query2, [id], (err2, rows2, fields2) => {
        if(rows2.length>0) {
          console.log("la boleta ya  esta en registrada");
          res.json({error: "la boleta ya  esta registrada"});
        } else if(!err2){

          mysqlConnection.query(query3, [id,correo,1,finalpass], (err3, rows3, fields3) => {
            if(!err3) {
              console.log("Usuario guardado");
              res.json({status: "Usuario guardado"});
            } else{
              console.log(err3);
              res.json({error: "ups hubo algun error :("});
            }
          });
          
        } else{
          console.log(err2);
          res.json({error: err2});
        }
      });
    } else {
      console.log(err);
      res.json({error: err});
    }
  });


});

router.post('/login', async (req, res) => {
  const { id, password } = req.body;
  console.log('login');
  
  mysqlConnection.query('SELECT password FROM Usuario where id=?',[id,password], async  (err, rows, fields) => {
    if(rows.length<1) {
      res.json({error: "Usuario o Contraseña incorrecta"});
    }if(!err) {
      //console.log('rows',rows[0]['password'])
      const validPass =await helpers.matchPassword(password,rows[0]['password']);
      if(validPass)
      res.json({status: "ok"});
      else
      res.json({error: "Usuario o Contraseña incorrecta"});
    } else {
      console.log(err);
      res.json({error: "ups hubo algun error :("});
    }
  });  
});

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
});



module.exports = router;
