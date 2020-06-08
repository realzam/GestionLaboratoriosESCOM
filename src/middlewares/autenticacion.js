const jwt = require('jsonwebtoken');
const mysqlConnection = require('../database.js');
let verificaToken = async (req, res, next) => {

     const {token } = req.params;

     var val=await tokenExist(token)
     if(!val)
     return res.status(401).json({
        ok: false,
        err: {
            message: 'Token no válido o expiro'
        }
    });
    jwt.verify(token, process.env.SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                err: {
                    message: 'Token no válido'
                }
            });
        }

        req.usuario = decoded.id;
        next();

    });

}

const tokenExist = (token) => {
    return new Promise(resolve => {
      const query = "select * from tokenRecovery where token=? limit 1";
      console.log('tokenExist');
      mysqlConnection.query(query, [token], (err, rows, fields) => {
        if (!err) {
            if(rows.length>0)
            {
                resolve(true)
            }
          resolve(false);
        }
        else {
          console.log(err)
          resolve(false);
        }
      });
    })
  }

module.exports = {
    verificaToken
}