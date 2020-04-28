var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'enigmalibro@gmail.com',
    pass: 'adoescom2019'
  }
});


function destino(des)
{
  var mail={
  from: 'enigmalibro@gmail.com',
  to: des,
  subject: 'Sending Email using Node.js',
  text: `Tadadadada2`
  };
  return mail;
}
/*var mailOptions = {
  from: 'enigmalibro@gmail.com',
  to: 'sza0210escom@gmail.com',
  subject: 'Sending Email using Node.js',
  text: `The game2`
};*/

transporter.sendMail(destino('jolij88614@iopmail.com'), function(error, info){
  if (error) {
    console.log(error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});

module.exports = transporter;