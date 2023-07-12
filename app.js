require('dotenv').config();
const express = require('express')
const mqtt = require('mqtt')

const app = express()
const port = process.env.PORT || process.env.SERVER_PORT;


app.get('/', async (req, res) => {
    res.send('Hello World!');
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})