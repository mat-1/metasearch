"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStatus = void 0;
const mcproto_1 = require("mcproto");
const defaultOptions = {
    checkPing: true,
    timeout: 5000,
    protocol: 1
};
async function getStatus(host, port, options) {
    options = { ...defaultOptions, ...options };
    const client = await mcproto_1.Client.connect(host, port, {
        connectTimeout: options.timeout,
        timeout: options.timeout
    });
    client.send(new mcproto_1.PacketWriter(0x0).writeVarInt(options.protocol)
        .writeString(host).writeUInt16(client.socket.remotePort)
        .writeVarInt(mcproto_1.State.Status));
    client.send(new mcproto_1.PacketWriter(0x0));
    const status = (await client.nextPacket(null, false)).readJSON();
    if (options.checkPing) {
        client.send(new mcproto_1.PacketWriter(0x1).write(Buffer.alloc(8)));
        const start = Date.now();
        await client.nextPacket(0x1);
        status.ping = Date.now() - start;
    }
    client.end();
    return status;
}
exports.getStatus = getStatus;
