const mongoose = require("mongoose");
const cfg = require("../config.json");

let connected = false;

const connect = async () => {
    if (connected) return;
    const uri = (cfg.mongodb ?? "").replace(/\/+(\?|$)/, "$1");
    await mongoose.connect(uri);
    connected = true;
    global.log.info("MongoDB: Connected");
};

module.exports = { connect, mongoose };
