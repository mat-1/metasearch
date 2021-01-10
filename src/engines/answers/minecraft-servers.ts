import { getStatus } from '../../mcstatus'

const minecraftRegex = /^(?:(?:minecraft|mc|server|ping|srv|serv|mine craft| )*?) *\b([-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}(?::\d{5})?)\b *(?:(?:minecraft|mc|server|ping|srv|serv|mine craft| )*?)$/i

const colorCodes = {
	0: '#000000',
	1: '#0000be',
	2: '#00be00',
	3: '#00bebe',
	4: '#be0000',
	5: '#be00be',
	6: '#ffaa00',
	7: '#bebebe',
	8: '#3f3f3f',
	9: '#3f3ffe',
	a: '#3ffe3f',
	b: '#3ffefe',
	c: '#fe3f3f',
	d: '#fe3ffe',
	e: '#fefe3f',
	f: '#ffffff',

	black: '#000000',
	dark_blue: '#0000be',
	dark_green: '#00be00',
	dark_aqua: '#00bebe',
	dark_red: '#be0000',
	dark_purple: '#be00be',
	gold: '#ffaa00',
	gray: '#bebebe',
	dark_gray: '#3f3f3f',
	blue: '#3f3ffe',
	green: '#3ffe3f',
	aqua: '#3ffefe',
	red: '#fe3f3f',
	light_purple: '#fe3ffe',
	yellow: '#fefe3f',
	white: '#ffffff'
}

const serverAliases = {
	hypixel: 'mc.hypixel.net',
	wynncraft: 'play.wynncraft.com',
	'wynncraft.com': 'play.wynncraft.com'
}

const otherStyleCodes = {
	l: 'font-weight: bold;'
}

function stringToColor(colorCode) {
	return colorCodes[colorCode] || colorCode
}

function jsonColorCodes(jsonObject) {
	if (Array.isArray(jsonObject)) {
		const parts = []
		for (const part of jsonObject)
			parts.push(jsonColorCodes(part))
		return parts.join('')
	}

	const style = []
	if (jsonObject.bold) style.push('font-weight: bold')
	if (jsonObject.color) style.push('color: ' + stringToColor(jsonObject.color))
	let innerHtml = colorCodeToHtml(jsonObject.text)
	if (jsonObject.extra) innerHtml += jsonColorCodes(jsonObject.extra)
	let html = ''
	if (style.length > 0) {
		const joinedStyles = style.join(';')
		html += `<span style="${joinedStyles}">`
	}
	html += innerHtml
	if (style) { html += '</span>' }
	return html
}

function flattenJsonText(jsonObject) {
	if (Array.isArray(jsonObject)) {
		const parts = []
		for (const part of jsonObject)
			parts.push(jsonColorCodes(part))
		return parts.join('')
	}

	let text = jsonObject.text
	if (jsonObject.extra) { text += flattenJsonText(jsonObject.extra) }
	return text
}

function convertColorCodesToHtml(code, symbol = '§') {
	let currentColor = null
	let output = ''
	let otherActiveStyles = new Set()
	let i = -1
	let color
	let style
	while (i < code.length - 1) {
		i += 1
		if (code[i] === symbol) {
			i += 1
			if (colorCodes[code[i]]) {
				if (currentColor) { output += '</span>' }
				color = colorCodes[code[i]]
				style = `color:${color}`
			} else if (otherStyleCodes[code[i]]) {
				style = otherStyleCodes[code[i]]
				otherActiveStyles.add(code[i])
			} else if (code[i] === 'r') {
				if (currentColor) { output += '</span>' }
				for (const _ of Array.from(otherActiveStyles)) {
					output += '</span>'
				}
				otherActiveStyles = new Set()
				continue
			}
			output += `<span style="${style}">`
			currentColor = color
		} else {
			output += code[i]
		}
	}
	if (currentColor) { output += '</span>' }
	return output
}

function flattenColorCode(code) {
	if (typeof code === 'string') { return code.replace(/§./g, '') } else { return flattenJsonText(code) }
}

function colorCodeToHtml(code) {
	if (typeof code === 'string') { return convertColorCodesToHtml(code) } else { return jsonColorCodes(code) }
}

function includesCaseInsensitive(string1, string2) {
	const index = string2.toLowerCase().indexOf(string1.toLowerCase())
	if (index === -1) return false
	return string2.slice(index, index + string1.length)
}

function isIp(string: string) {
	return /^((?:2[0-4]\d)|(?:25[0-5])|(?:1?\d?\d))\.((?:2[0-4]\d)|(?:25[0-5])|(?:1?\d?\d))\.((?:2[0-4]\d)|(?:25[0-5])|(?:1?\d?\d))\.((?:2[0-4]\d)|(?:25[0-5])|(?:1?\d?\d))$/.test(string)
}

function extractServerName(hostName, description) {
	if (isIp(hostName)) return hostName
	hostName = hostName.split(':')[0] // remove the port, if it exists
	const hostNameParts = hostName.split('.')
	const tld = hostNameParts[hostNameParts.length - 1]
	const sld = hostNameParts[hostNameParts.length - 2]
	const sldAndTld = sld + '.' + tld
	const sldAndTldSpaced = sld + ' ' + tld
	if (description.toLowerCase().includes(hostName.toLowerCase())) { return hostName.toLowerCase() } else if (description.toLowerCase().includes(sldAndTld.toLowerCase())) { return sldAndTld.toLowerCase() } else if (RegExp(`\b${sldAndTldSpaced}\b`, 'i').test(description)) { return includesCaseInsensitive(sldAndTldSpaced, description) } else { return sld.charAt(0).toUpperCase() + sld.slice(1) }
}

export async function request(query) {
	const regexMatch = query.match(minecraftRegex)
	if (!regexMatch && !serverAliases[query]) {
		console.log('didnt match regex')
		return {}
	}
	let minecraftHost
	if (serverAliases[query.toLowerCase()]) 
		minecraftHost = serverAliases[query.toLowerCase()]
	else
		minecraftHost = regexMatch[1]
	let status
	let port: number | null
	const splitHost = minecraftHost.split(':')

	if (splitHost.length > 1) {
		minecraftHost = splitHost[0]
		port = parseInt(splitHost[1])
	} else
		port = null
	console.log(minecraftHost, port)
	try {
		status = await getStatus(minecraftHost, port, {
			timeout: 500
		})
	} catch (e) {
		return {}
	}
	if (status) {
		const serverName = extractServerName(minecraftHost, flattenColorCode(status.description))
		return {
			answer: {
				template: 'minecraft',
				name: serverName,
				version: status.version.name,
				versionHtml: colorCodeToHtml(status.version.name),
				versionProtocol: status.version.protocol,
				descriptionHtml: colorCodeToHtml(status.description),
				players: status.players,
				favicon: status.favicon,
				ping: status.ping,
				hasPlayers: status.players != undefined
			}
		}
	} else
		return {}
}

