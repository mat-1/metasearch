// seconds in a day
// how many seconds are in a day
// day to second
const unitsInUnitRegex = /^(?:how many |number of )?(.+?)s? (?:(?:are )?in|to) (a|\d+) (.+?)s?$/i


const timeUnits = {
	'second': 1,
	'minute': 1 * 60,
	'hour'  : 1 * 60 * 60,
	'day'   : 1 * 60 * 60 * 24,
	'month' : 1 * 60 * 60 * 24 * 30.4167,
	'year'  : 1 * 60 * 60 * 24 * 365.242,
}

export async function request(query) {
	const regexMatch = query.match(unitsInUnitRegex)
	if (!regexMatch) return {}
	const currentUnit = regexMatch[1].trim().toLowerCase()
	const targetUnit = regexMatch[3].trim().toLowerCase()
	let targetUnitAmount = regexMatch[2].trim().toLowerCase()

	targetUnitAmount = isNaN(parseInt(targetUnitAmount)) ? 1 : parseInt(targetUnitAmount)


	if (!(timeUnits[currentUnit] && timeUnits[targetUnit])) {
		return {}
	}

	let answer = (timeUnits[targetUnit] * targetUnitAmount) / timeUnits[currentUnit]

	// nope
	if (answer == 1) return {}

	let currentUnitPlural = answer == 1 ? currentUnit : currentUnit + 's'
	
	let targetUnitAmountDisplay = targetUnitAmount == 1 ? 'a' : targetUnitAmount
	let targetUnitPlural = targetUnitAmount == 1 ? targetUnit : targetUnit + 's'

	return {
		answer: {
			content: `There are ${answer} ${currentUnitPlural} in ${targetUnitAmountDisplay} ${targetUnitPlural}`,
		}
	}
}
