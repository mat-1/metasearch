const hexRegex = /^(?:hex(?:adecimal)?|base ?16?) ?(encode|decode|)(?:\s+)(.+)$/i

function hexEncode(string) {
	try {
		return Buffer.from(string).toString('hex')
	} catch {
		return null
	}
}
function hexDecode(string) {
	try {
		let decoded = Buffer.from(string, 'hex').toString('utf8')
		if (decoded.includes('�')) return null
		else return decoded
	} catch {
		return null
	}
}

export async function request(query) {
	const regexMatch = query.match(hexRegex)
	if (!regexMatch) return {}
	const intent = regexMatch[1].trim().toLowerCase()
	const string = regexMatch[2].trim()
	let encoded
	let decoded
	if (intent == 'encode') {
		encoded = hexEncode(string)
	} else if (intent == 'decode') {
		decoded = hexDecode(string)
	} else {
		encoded = hexEncode(string)
		decoded = hexDecode(string)
	}

	if (!encoded && !decoded) return {}

	let title = null
	let answer
	if (encoded && decoded) {
		title = 'hex encode & decode'
		answer = `${encoded}\n\n${decoded}`
	} else if (encoded) {
		title = 'hex encode'
		answer = encoded
	} else if (decoded) {
		title = 'hex decode'
		answer = decoded
	}

	return {
		answer: {
			title: title,
			content: answer,
		}
	}
}
