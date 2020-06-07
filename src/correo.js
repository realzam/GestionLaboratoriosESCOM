require('dotenv').config();

const nodemailer = require('nodemailer');

/*
let traspoter=nodemailer.createTransport({
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
    text:'funciona',
    attachments:[
        {filename:''}
    ]
}

  traspoter.sendMail(mailOptions,function (err,data) {
        if(err){
            console.log('error occurrus',err);
            return 'error occurrus '+err;
        }else{
            console.log('correo enviado')
            return 'correo enviado';
        }
    })

html: '<br><p>Click <a href="example://gizmos">here</a> to reset your password</p><br><p>Click <a href="http://proyectoescom.herokuapp.com/redirect">here</a> to reset your password</p>'
*/
function eviarCorreo(to, subject, text, attachments,html) {
    return new Promise(async function (resolve, reject) {
        let traspoter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.PASSWORD_EMAIL
            }
        });
        let mailOptions = {
            from: '"Control Laboraotrios Escom" <'+process.env.Email+'>',
            to: to,
            subject: subject,
            text: text,
            attachments: attachments,
            html:html
        }
        traspoter.sendMail(mailOptions, function (err, data) {
            if (err) {
                console.log('error occurrus', err);
                resolve({ ok: false, message: 'ups hubo un error :(' });
            } else {
                console.log('correo enviado')
                resolve({ ok: true, message: 'Correo enviado' });
            }
        })
    })
}
module.exports.eviarCorreo = eviarCorreo;


