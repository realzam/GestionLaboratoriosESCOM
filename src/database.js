var mysql = require('mysql');
var mysqlConnection;

function handleDisconnect () {
  mysqlConnection = mysql.createConnection({
    host: 'bavkz0xwefeqqfhvyqt8-mysql.services.clever-cloud.com',
    user: 'unjghosy48mmtkti',
    password: 'mJYQzIeiIiuwRPfXd2W7',
    database:'bavkz0xwefeqqfhvyqt8'
  });
  mysqlConnection.connect(function (err) {
    if (err) {
      setTimeout(handleDisconnect, 2000); 
    } 
  }); 
  
  mysqlConnection.on('error', function (err) {
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
      console.error('Database connection was closed.');
      handleDisconnect();
    }
    if (err.code === 'ER_CON_COUNT_ERROR') {
      console.error('Database has to many connections');
      handleDisconnect();
    }
    if (err.code === 'ECONNREFUSED') {
      console.error('Database connection was refused');
      handleDisconnect();
    }
  });
}
handleDisconnect();

mysqlConnection.query('USE bupvlgevftpcqhgzuwql');
console.log('connected to the database');
setInterval(function () {
  mysqlConnection.query('SELECT 1');
}, 1000*60);

module.exports = mysqlConnection;
