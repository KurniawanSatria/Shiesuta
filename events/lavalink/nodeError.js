const { sendStatus } = require("../../lib/utils");

module.exports = {
    name: "nodeError",
    emitter: "lavalink",
    run(ctx, node, error) {
        global.log.error(`Node ${node.id} error: ${error?.message ?? error}`);
        sendStatus(ctx.client, `⚠️ **Node \`${node.id}\` error** — \`${error?.message ?? error}\``);
    }
};
