require('dotenv').config();
const {DeviceController} = require("../modules/Device/Device.controller");
const {mqttConnect} = require("../config/mqtt");


exports.mqttLoader = () => {
    let client = mqttConnect;

    client.on('connect', () => {
        console.log('MQTT Connected and subscribe');
        DeviceController.allSubscribe(client);
    })

    client.on('message',  (topic, message) => {
        DeviceController.receiveMessage(topic, message);
    })
}