var mysql = require('mysql');
var mysqlConnection;

function handleDisconnect () {
  mysqlConnection = mysql.createConnection({
    host: 'bupvlgevftpcqhgzuwql-mysql.services.clever-cloud.com',
    user: 'uamtgxbemb9q9l7b',
    password: 'dIpFnEEXuHGYENROSD9f',
    database:'bupvlgevftpcqhgzuwql'
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
}, 60000);

module.exports = mysqlConnection;
