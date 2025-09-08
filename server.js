const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require("cors");
const dotenv = require('dotenv');

dotenv.config();
app.use(bodyParser.json());
app.use(cors());
const routes = require('./routes/routes');

app.get('/',(req,res)=>{
    console.log("Welcome to the payment api");
    res.send("Welcome to the payment api")
})

app.use('/api', routes);

const port = process.env.PORT || 3000;
app.listen(port,()=>{
    console.log(`Server is running on port ${port}`);
})