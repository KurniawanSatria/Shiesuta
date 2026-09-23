const { sendStatus } = require("../../lib/utils");

module.exports = {
    name: "nodeDisconnect",
    emitter: "lavalink",
    run(ctx, node, reason) {
        global.log.warn(`Node ${node.id} disconnected: ${reason?.code ?? reason ?? "unknown"}`);
        sendStatus(ctx.client, `🔴 **Node \`${node.id}\` disconnected** — \`${reason?.code ?? reason ?? "unknown"}\``);
    }
};
