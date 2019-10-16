const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const config = require('./config/config');

const routes = require('./routes');

const app = express();
const port = 3000;

mongoose.connect(config.mongoUrl, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true }).then((db) => {
    console.log('Database connected');
});

app.use(cors());
app.use(bodyParser.json());
app.use(morgan("combined"));

app.use('/api/', routes);

app.listen(port, () => {
    console.log(`Server started on port: ${port}`);
});