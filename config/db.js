require('dotenv').config();
const mongoose = require("mongoose");

exports.mongooseLoader = () => {
    mongoose.connect(process.env.DATABASE_URL, {
        dbName: 'growsystem'
    }).then(() => {
        console.log('Connected to MongoDB');
    })
        .catch((error) => {
            console.error('Error connecting to MongoDB:', error);
        });
}