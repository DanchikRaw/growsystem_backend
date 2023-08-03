const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let control = new Schema(
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
        }
    },
    { collection: "control" }
);

module.exports = mongoose.model("control", control);