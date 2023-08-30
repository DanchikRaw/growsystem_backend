const mqtt = require("mqtt");
exports.mqttConnect = mqtt.connect(process.env.MQTT_URL, {
    clientId:process.env.MQTT_CLIENT,
    username:process.env.MQTT_USER,
    password:process.env.MQTT_PASSWORD,
});