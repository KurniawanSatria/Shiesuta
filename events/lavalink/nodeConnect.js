const { sendStatus } = require("../../lib/utils");

module.exports = {
    name: "nodeConnect",
    emitter: "lavalink",
    run(ctx, node) {
        global.log.info(`Node ${node.id} connected`);
        sendStatus(ctx.client, `🟢 **Node \`${node.id}\` connected**`);
    }
};
