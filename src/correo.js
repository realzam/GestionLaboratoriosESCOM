require('dotenv').config();

const nodemailer = require('nodemailer');

let traspotter=nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:process.env.Email,
        pass:process.env.passwordEmail
    }
});

let mailOptions={
    from:process.env.Email,
    to:'sza0210escom@gmail.com',
    subject:'tets testing',
    text:'funciona'
}

traspotter.sendMail(mailOptions,function (err,data) {
    if(err){
        console.log('error occurrus',e);
    }else{
        console.log('correo enviado')
    }
})