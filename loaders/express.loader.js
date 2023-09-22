require('dotenv').config();
const express = require("express");
const cors = require('cors')
const {json} = require("express");
const routes = require('./../routes/index');
const helmet = require('helmet')

const port = process.env.PORT || process.env.SERVER_PORT;

exports.expressLoader = () => {
    const app = express();

    app.use(helmet())
    app.disable('x-powered-by')

    app.use(json());

    app.use(cors({
        origin: process.env.FRONTEND_URL
    }));

    app.use('/api', routes);

    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
    })
}