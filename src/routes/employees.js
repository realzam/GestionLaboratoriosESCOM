const express = require('express');
const router = express.Router();

const mysqlConnection  = require('../database.js');

// GET all Employees
router.get('/', (req, res) => {
  console.log('ruta raiz');
  
  mysqlConnection.query('SELECT * FROM Laboratorio', (err, rows, fields) => {
    if(!err) {
      res.json(rows);
    } else {
      console.log(err);
    }
  });  
});

// GET An Employee
router.get('/:id', (req, res) => {
  const { id } = req.params; 
  mysqlConnection.query('SELECT * FROM Usuario WHERE id = ?', [id], (err, rows, fields) => {
    if (!err) {
      res.json(rows[0]);
    } else {
      console.log(err);
    }
  });
});

// DELETE An Employee
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  mysqlConnection.query('DELETE FROM employee WHERE id = ?', [id], (err, rows, fields) => {
    if(!err) {
      res.json({status: 'Employee Deleted'});
    } else {
      console.log(err);
    }
  });
});

// INSERT An Employee
//0 alumno
//1 docente
//2 adminsitrador
router.post('/add/alumno', (req, res) => {
  console.log("body",req.body);
  
  const {id, correo, password} = req.body;
  console.log(id, correo, password);
  const query ="insert into  Usuario (id,correo,tipoUsuario,password) values (?,?,?,?)"
  mysqlConnection.query(query, [id, correo,1,password], (err, rows, fields) => {
    if(!err) {
      res.json({status: 'usuario Saved'});
    } else {
      console.log(err);
    }
  });

});

router.put('/modifyAlumno/:id', (req, res) => {
  const { name, salary } = req.body;
  const { id } = req.params;
  const query ="update  Usuario where nombre=?,apellido=?,correo=?,?"
  mysqlConnection.query(query, [id, name, salary], (err, rows, fields) => {
    if(!err) {
      res.json({status: 'Employee Updated'});
    } else {
      console.log(err);
    }
  });
});

module.exports = router;
