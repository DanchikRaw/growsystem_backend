const Device = require('./Device.model');
const Sensor = require('./Sensor/Sensor.model');
const SensorHistory = require('./SensorHistory/SensorHistory.model')

require('./../Worker/Worker.model');
module.exports.DeviceService = {
    async findAll() {
        return Device.find({}).populate({path:'sensors', select: 'topic name'}).exec();
    },
    async receiveMessage(topic, message) {
        try {
            const topicInfo = topic.split('_');

            if (!topicInfo || topicInfo.length !== 2) {
                throw new Error('Invalid topic format');
            }

            const device = await Device.findOne({topic: topicInfo[0]})
                .populate({
                    path: 'sensors',
                    select: 'name type',
                    match: {topic: topicInfo[1]}
                })
                .exec();

            if (device && device.sensors.length > 0) {
                const newSensorData = new SensorHistory({
                    sensor: device.sensors[0]._id,
                    value: message.toString(),
                });

                const newRes = await newSensorData.save();
                if (newRes) {
                    return true;
                }
            }

            return false;
        } catch (error) {
            console.error('Error in receiveMessage:', error);
            return false;
        }
    }
}