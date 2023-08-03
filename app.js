const {expressLoader} = require("./loaders/express.loader");
const {mqttLoader} = require("./loaders/mqtt.loader");
const {mongooseLoader} = require("./config/db");

mongooseLoader();
mqttLoader();
expressLoader();