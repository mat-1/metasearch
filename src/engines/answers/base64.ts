const base64Regex = /^b(?:ase)?64( encode| decode|)(?:\s+)(.+)$/i

function base64Encode(string) {
	try {
		return Buffer.from(string).toString('base64')
	} catch {
		return null
	}
}
function base64Decode(string) {
	try {
		let decoded = Buffer.from(string, 'base64').toString('utf8')
		if (decoded.includes('�')) return null
		else return decoded
	} catch {
		return null
	}
}

export async function request(query) {
	const regexMatch = query.match(base64Regex)
	if (!regexMatch) return {}
	const intent = regexMatch[1].trim().toLowerCase()
	const string = regexMatch[2].trim()
	let encoded
	let decoded
	if (intent == 'encode') {
		encoded = base64Encode(string)
	} else if (intent == 'decode') {
		decoded = base64Decode(string)
	} else {
		encoded = base64Encode(string)
		decoded = base64Decode(string)
	}

	if (!encoded && !decoded) return {}

	let title = null
	let answer
	if (encoded && decoded) {
		title = 'base64 encode & decode'
		answer = `${encoded}\n\n${decoded}`
	} else if (encoded) {
		title = 'base64 encode'
		answer = encoded
	} else if (decoded) {
		title = 'base64 decode'
		answer = decoded
	}

	return {
		answer: {
			title: title,
			content: answer,
			url: encoded ? 'https://www.base64encode.org/' : 'https://www.base64decode.org/'
		}
	}
}
