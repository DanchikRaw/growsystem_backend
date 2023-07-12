require('dotenv').config();
const express = require('express')
const mqtt = require('mqtt')

const app = express()


app.get('/', async (req, res) => {
    res.send('Hello World!');
})

app.listen(process.env.SERVER_PORT, () => {
    console.log(`Example app listening on port ${process.env.SERVER_PORT}`)
})