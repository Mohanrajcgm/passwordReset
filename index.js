require('dotenv').config();
const express = require('express');
const cors = require('cors');
//Importing DB
const connect = require('./connect');
//imporing routes

const authRoutes = require('./routes/authRoutes.js')
// web server
const app = express();

app.use(express.json());

app.use(cors());

app.get('/', (req, res) => {
  res.status(200).json('Welcome to My App');
});

// To connected with routes
app.use('/api/users', authRoutes);

let port = process.env.PORT || 4001;

app.listen(port, async () => {
  console.log(`The App is running on the port ${port}`);
  // connect to the database
  await connect();
});