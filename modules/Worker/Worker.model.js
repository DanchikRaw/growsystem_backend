const mongoose = require("mongoose");

const Schema = mongoose.Schema;

let workers = new Schema(
    {
        device: {
            type: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'devices'
            }
        },
        name: {
            type: String
        },
        id: {
            type: String
        }
    },
    { collection: "workers" }
);

module.exports = mongoose.model("workers", workers);