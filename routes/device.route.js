const { Router } = require('express');
const {DeviceController} = require("../modules/Device/Device.controller");
const router = Router()

router.get('/device', DeviceController.getAllDevice)

module.exports = router;