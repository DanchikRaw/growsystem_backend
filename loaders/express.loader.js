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

    const allowedOrigins = [
        'http://localhost:3000',
        'https://growsystembackend-production.up.railway.app'
    ];

    app.use(cors({
        origin: function (origin, callback) {
            // Проверяем, что запрос приходит с одного из разрешенных доменов
            if (allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        }
    }));

    app.use('/api', routes);

    app.listen(port, () => {
        console.log(`Example app listening on port ${port}`);
    })
}