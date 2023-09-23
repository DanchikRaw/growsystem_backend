const { Router } = require('express');
const {WorkerController} = require("../modules/Worker/Worker.conroller");
const router = Router()

router.get('/', (req, res) => {
    res.send('Hello World!');
})

router.get('/workers', WorkerController.getWorkersHistoryByDevice);
router.get('/worker', WorkerController.getWorkerTotalHours);

router.use(require('./device.route'));

module.exports = router