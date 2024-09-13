const express = require("express");
const connectDB = require("./db/connectDB");
const routes = require('./routes/routes');
const cors = require('cors');
require("dotenv").config();



const PORT =  5000;

const app = express();
app.use(express.json());
app.use('/api', routes);


app.use(cors());


const start = async () => {
  try {
    await connectDB(process.env.MONGO_URL);
  } catch (err) {
    console.log(err);
  }
};

start();


app.listen(PORT, () => {
  console.log(`Server on ${PORT}`);
});