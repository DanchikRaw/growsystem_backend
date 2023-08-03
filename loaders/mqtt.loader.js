require('dotenv').config();
const mqtt = require('mqtt')
const {DeviceController} = require("../modules/Device/Device.controller");


exports.mqttLoader = () => {
    let client = mqtt.connect(process.env.MQTT_URL, {
        clientId:process.env.MQTT_CLIENT,
        username:process.env.MQTT_USER,
        password:process.env.MQTT_PASSWORD,
    });

    client.on('connect', () => {
        DeviceController.allSubscribe(client);
    })

    client.on('message',  (topic, message) => {
        DeviceController.getNewData(topic, message);
    })
}