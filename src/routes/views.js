  
const express = require('express');
const router = express.Router();


router.get('/views/home', (req, res) => {
    res.render('home');
  });

  router.get('/views/my', (req, res) => {
    res.render('sok');
  });
module.exports = router;