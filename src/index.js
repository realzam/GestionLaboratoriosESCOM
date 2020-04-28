const express = require('express');
const app = express();
const request = require('request');
const transporter=require('./sendemail.js')
// Settings
app.set('port', process.env.PORT || 3000);

// Middlewares
app.use(express.json());

// Routes
app.use(require('./routes/employees'));

// Starting the server
app.listen(app.get('port'), () => {
  console.log('Server on port',app.get('port'));
  
  setInterval(interval, 1000*60*3);
  
});

let interval = ()=>{
  console.log('hola mundo, no sleep');
  request('https://proyectoescom.herokuapp.com/', function (error, res, body) {
    if (!error && res.statusCode == 200) {
        
    }
});
}