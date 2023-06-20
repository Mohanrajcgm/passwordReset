

const usersDetails = require('../models/user.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');

const securePassword = async (password) => {
  let salt = await bcrypt.genSalt(10);
  let hash = await bcrypt.hash(password, salt);
  return hash;
};

exports.signup = async (req, res) => {
  try {
    const newPassword =await securePassword(req.body.password);
    req.body.hashedPassword = newPassword;

    let user = new usersDetails(req.body);
    user.save((err, data) => {
      if (err) {
        console.log(err);
        return res
          .status(400)
          .send({ message: 'Data is not inserted properly' });
      } else {
        res.status(201).send({userID: data._id,message:'user added successfully'});
      }
    });
  } catch (error) {
    res.status(500).send('Internal server error');
    console.log(error);
  }
};

exports.signin = async (req, res) => {
  try {
    // fetch user with email id from DB
    usersDetails.findOne({ email: req.body.email }, async (err, user) => 
    {
      if (err || !user) {
        res.status(401).send({ message: 'Invalid Credentials' });
      } else {
        // if user given password is == user password in db
        let isPasswordMatch = await bcrypt.compare(
          req.body.password,
          user.hashedPassword
        );
        if (isPasswordMatch) {
          let token = jwt.sign(
            { name: user.name, id: user._id },
            process.env.SECRET_KEY
          );
        
          res.send({ msg: 'successfully logged in', token: token, user: user });
        } else {
          res.status(401).send({ message: 'Invalid Credentials' });
        }
      }
    });
  } catch (error) {
    res.status(500).send('Internal server error');
    console.log('something went wrong', error);
  }
};

// reset password mail
exports.resetPasswordMail = async (name, email, token) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    var message = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'For Reset Password',
      text: 'Please click the link below and reset your password',
      html:
        '<p> Hi ' +
        name +
        ', Please click <a href="https://password-reset-project.netlify.app/#/reset-password/' +
        token +
        '"> here </a> to reset your password.The link will be expired in 15 minutes.</p>',
    };

    transporter.sendMail(message, (err, info) => {
      if (err) {
        console.log(err);
      } else {
        console.log('Mail has been sent', info.response);
      }
    });
  } catch (error) {
    console.log(error);
  }
};

// forget password
exports.forgetPassword = async (req, res) => {
  try {
    const isUserExist = await usersDetails.findOne({ email: req.body.email });
    if (isUserExist) {
      const randomString = randomstring.generate();
      let token_pass = jwt.sign(
        { name: isUserExist.name, id: isUserExist._id },
        randomString,
        {
          expiresIn: '15m',
        }
      );
      const data = await usersDetails.updateOne(
        { email: req.body.email },
        { $set: { token: token_pass } }
      );
      resetPasswordMail(isUserExist.name, isUserExist.email, token_pass);
      res.status(200).send({
        message: 'Please check your inbox of email and reset your password',
      });
    } else {
      res.status(401).send({ message: 'Invalid Credentials' });
    }
  } catch (error) {
    res.status(500).send('Internal server error');
    console.log('something went wrong', error);
  }
};

// reset password
exports.resetPassword = async (req, res) => {
  try {
    if (req.body.password !== req.body.confirm_password) {
      res.status(400).send({ message: 'Passwords do not match' });
    } else {
      const token = req.params.token;
      const tokenData = await usersDetails.findOne({ token: token });
      if (tokenData) {
        const password = req.body.password;
        const newPassword = await securePassword(password);
        const userData = await usersDetails.findByIdAndUpdate(
          { _id: tokenData._id },
          { $set: { hashedPassword: newPassword, token: '' } },
          { new: true }
        );
        res.status(200).send({
          message: 'Your password reset successfully',
          data: userData,
        });
      } else {
        res.status(400).send({ message: 'This link has been expired' });
      }
    }
  } catch (error) {
    res.status(500).send('Internal server error');
    console.log('something went wrong', error);
  }
};