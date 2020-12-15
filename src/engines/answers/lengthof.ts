const lengthofRegex = /^(?:(?:how long is|len(?:gth(?: of)?)?|(?:(?:number of |how many )?char(?:acters|s) in))(.+?)|(.+?)(?:len(?:gth)))$/i

export async function request(query) {
	const regexMatch = query.match(lengthofRegex)
	if (!regexMatch) return {}
	const matched = regexMatch[1].trim() || regexMatch[2].trim()
	return {
		answer: {
			content: `${matched} is ${matched.length} characters long`
		}
	}
}

