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
    var _a, _b;
    options = { ...defaultOptions, ...options };
    const client = await mcproto_1.Client.connect(host, port, {
        connectTimeout: options.timeout,
        timeout: options.timeout
    });
    client.send(new mcproto_1.PacketWriter(0x0).writeVarInt((_a = options.protocol) !== null && _a !== void 0 ? _a : 99999)
        .writeString(host).writeUInt16((_b = client.socket.remotePort) !== null && _b !== void 0 ? _b : 25565)
        .writeVarInt(mcproto_1.State.Status));
    client.send(new mcproto_1.PacketWriter(0x0));
    const status = (await client.nextPacket(undefined, false)).readJSON();
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
