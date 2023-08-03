const Sensor = require('./Sensor.model');
const Device = require('./../Device.model');

module.exports.SensorService = {
    async findAllTopic() {
        return Sensor.find().populate('device').exec()
    }
}