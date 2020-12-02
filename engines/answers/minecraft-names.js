const { requestJSON } = require('../../parser')

// if you want to make this regex less cursed, good luck :)
const minecraftRegex = /^(?:(?:(?:(?:minecraft|mc|mine craft|namemc) ?)+(?:name|namemc|ign)? *\b(.{1,16}|[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12})\b)|(?:\b(.{1,16}|[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12})\b(?:(?:minecraft|mc|mine craft|namemc) ?)+(?:name|namemc|ign)? *))$/i


async function requestMojang(name) {
	return await requestJSON('https://api.ashcon.app/mojang/v2/user/' + encodeURI(name))
}


async function request(query) {
	const regexMatch = query.match(minecraftRegex)
	if (!regexMatch) return {}
	let name = (regexMatch[1] || regexMatch[2]).trim()
	const { error, uuid, username, username_history } = await requestMojang(name)
	if (error) return {}
	let undashedUuid = uuid.replace(/-/g, '')
	return {
		answer: {
			template: 'minecraft-name',
			username,
			uuid,
			undasheduuid: undashedUuid,
			url: `https://namemc.com/${encodeURI(undashedUuid)}`,
			history: username_history
		}
	}
}

module.exports = { request }