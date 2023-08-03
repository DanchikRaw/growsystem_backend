const { Router } = require('express');
const router = Router()

router.get('/', (req, res) => {
    res.send('Hello World!');
})

router.get('/express_backend', (req, res) => { //Строка 9
    res.send({ express: 'YOUR EXPRESS BACKEND IS CONNECTED TO REACT' }); //Строка 10
});

router.use(require('./device.route'));

module.exports = router