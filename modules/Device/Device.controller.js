const {SensorService} = require("./Sensor/Sensor.service");
const {DeviceService} = require("./Device.service");

module.exports.DeviceController = {
    allSubscribe(client) {
        SensorService.findAllTopic().then((result) => {
            for(const topic of result) {
                client.subscribe(topic.device.topic + '_' + topic.topic);
            }
        })
    },
    receiveMessage(topic, message) {
        DeviceService.receiveMessage(topic, message).then((result) => {
            return result;
        });
    },
    getAllDevice(req, res) {
        DeviceService.findAll().then((result) => {
            res.send(result);
        })
    }
}