const device = require('./Device.model');
require('./Sensor/Sensor.model');

module.exports.DeviceService = {
    async findAll() {
        return await device.find({}).populate({path:'sensors', select: 'topic name'}).exec();
    }
}