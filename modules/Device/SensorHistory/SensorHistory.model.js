const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let sensorsHistory = new Schema(
    {
        sensor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'sensors'
        },
        value: {
            type: String
        },
        date: {
            type: Date,
            default: Date.now
        }
    },
    { collection: "sensorsHistory" }
);

module.exports = mongoose.model("sensorsHistory", sensorsHistory);