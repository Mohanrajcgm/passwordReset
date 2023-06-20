const express = require('express')
const {
  forgetPassword,
  resetPassword,
  signin,
  signup,
} = require('../controller/auth')
const router = express.Router();

router.post('/signup', signup);

router.post('/signin', signin);

router.post('/forget-password', forgetPassword);

router.post('/reset-password/:token', resetPassword);
module.exports = router;