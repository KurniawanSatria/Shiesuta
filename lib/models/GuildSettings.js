const { mongoose } = require("../mongo");

const schema = new mongoose.Schema({
    guildId: { type: String, required: true, unique: true },
    autoPlay: { type: Boolean, default: true },
    lang: { type: String, default: "en" },
    prefix: { type: String, default: "." },
    volume: { type: Number, default: 80 }
}, { timestamps: true });

module.exports = mongoose.model("GuildSettings", schema);
