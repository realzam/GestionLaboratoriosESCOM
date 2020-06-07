const jwt = require('jsonwebtoken');

let verificaToken = (req, res, next) => {

     const {token } = req.params;

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

module.exports = {
    verificaToken
}