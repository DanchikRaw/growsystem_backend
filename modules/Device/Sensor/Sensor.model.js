const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let sensors = new Schema(
    {
        name: {
            type: String
        },
        topic: {
            type: String
        },
        type: {
            type: String
        },
        device: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'devices'
        },
        history: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'sensorsHistory'
            }
        ]
    },
    { collection: "sensors" }
);

module.exports = mongoose.model("sensors", sensors);