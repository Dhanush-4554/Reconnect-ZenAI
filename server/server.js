const express = require("express");
const connectDB = require("./db/connectDB");
const routes = require('./routes/routes');
require("dotenv").config();



const PORT =  5000;

const app = express();
app.use('/api', routes);



const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
  } catch (err) {
    console.log(err);
  }
};

start();

const server = app.listen(PORT, () => {
  console.log(`Server on ${PORT}`);
});