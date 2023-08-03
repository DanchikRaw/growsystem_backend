const {SensorService} = require("./Sensor/Sensor.service");
const {DeviceService} = require("./Device.service");

module.exports.DeviceController = {
    allSubscribe(client) {
        SensorService.findAllTopic().then((result) => {
            for(const topic of result) {
                client.subscribe(topic.device.name + '_' + topic.topic);
            }
        })
    },
    getNewData(topic, message) {
        console.log(message.toString())
    },
    getAllDevice(req, res) {
        DeviceService.findAll().then((result) => {
            res.send(result);
        })
    }
}