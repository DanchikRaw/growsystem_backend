const Device = require('./Device.model');
const Sensor = require('./Sensor/Sensor.model');
const SensorHistory = require('./SensorHistory/SensorHistory.model')

require('./../Worker/Worker.model');
module.exports.DeviceService = {
    async findAll() {
        return Device.find({}).populate({path:'sensors', select: 'topic name'}).exec();
    },
    async receiveMessage(topic, message) {
        let topicInfo = topic.split('_');
        let res = await Device.findOne({topic: topicInfo[0]}).populate({path:'sensors', select: 'name type', match: {topic: topicInfo[1]}}).exec();

        if (res) {
            let newSensorData = new SensorHistory({
                sensor: res.sensors[0]._id,
                value: message.toString(),
            })

            let newRes = await newSensorData.save();
            if (newRes) {
                return true;
            }
        }

        return false;
    }
}