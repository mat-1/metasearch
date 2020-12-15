const urlcodeRegex = /^(?:ur[li] (encode|decode) )(.+)$/i

export async function request(query) {
	const regexMatch = query.match(urlcodeRegex)
	if (!regexMatch) return {}
	const intent = regexMatch[1].trim().toLowerCase()
	const string = regexMatch[2].trim()
	let answer
	if (intent == 'encode')
		answer = encodeURIComponent(string)
	else if (intent == 'decode')
		answer = decodeURIComponent(string)

	if (!answer) return {}

	return {
		answer: {
			content: answer,
		}
	}
}
