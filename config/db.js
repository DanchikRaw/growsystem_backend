require('dotenv').config();
const mongoose = require("mongoose");

exports.mongooseLoader = () => {
    console.log('Connected to MongoDB');
    mongoose.connect(process.env.DATABASE_URL).then(() => {
        console.log('Connected to MongoDB');
    })
        .catch((error) => {
            console.error('Error connecting to MongoDB:', error);
        });
}