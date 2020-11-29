const { Client, PacketWriter, State } = require('mcproto')

const defaultOptions = {
	checkPing: true,
	timeout: 5000,
	protocol: 736
}


async function getStatus(host, port, options) {
	options = { ...defaultOptions, ...options }

	const client = await Client.connect(host, port, {
		connectTimeout: options.timeout,
		timeout: options.timeout
	})

	client.send(new PacketWriter(0x0).writeVarInt(options.protocol)
		.writeString(host).writeUInt16(client.socket.remotePort)
		.writeVarInt(State.Status))

	client.send(new PacketWriter(0x0))


	const status = (await client.nextPacket(null, false)).readJSON()

	if (options.checkPing) {
		client.send(new PacketWriter(0x1).write(Buffer.alloc(8)))
		const start = Date.now()

		await client.nextPacket(0x1)
		status.ping = Date.now() - start
	}

	client.end()

	return status
}

module.exports = { getStatus }