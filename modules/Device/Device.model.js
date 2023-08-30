const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let devices = new Schema(
    {
        topic: {
            type: String
        },
        type: {
            type: String
        },
        sensors: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'sensors'
        }],
        control: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'control'
        }]
    },
    { collection: "devices" }
);

module.exports = mongoose.model("devices", devices);