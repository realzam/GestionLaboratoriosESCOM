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
//1 alumno
//2 docente
//3 adminsitrador
router.post('/add/alumno', (req, res) => {
  console.log("body",req.body);
  
  const {id, correo, password} = req.body;
  console.log(id, correo, password);
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

          mysqlConnection.query(query3, [id,correo,1,password], (err3, rows3, fields3) => {
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

router.post('/login', (req, res) => {
  const { id, password } = req.body;
  
  mysqlConnection.query('SELECT id FROM Usuario where id=? and password=?',[id,password], (err, rows, fields) => {
    if(rows.length<1) {
      res.json({error: "Usuario o Contraseña incorrecta"});
    }if(!err) {
      res.json({status: "ok"});
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
