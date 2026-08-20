const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
    message: {
        type: String,
        required: true
    }
});

const Test = mongoose.model("Test", testSchema);

module.exports = Test;