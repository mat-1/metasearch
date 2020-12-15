const timezoneRegex = /^([0-9][1-4]?):?([0-5]?[0-9])? ?(am|pm)? (...) to (...)$/i

const timezones = {
	'GMT': 0,
	'UTC': 0,
	'ECT': 1,
	'EET': 2,
	'ART': 2,
	'CAT': 2,
	'EAT': 3,
	'MET': 3.5,
	'NET': 4,
	'PLT': 5,
	'IST': 5.5,
	'BST': 6,
	'VST': 7,
	'CTT': 8,
	'JST': 9,
	'ACT': 9.5,
	'AET': 10,
	'SST': 11,
	'NST': 12,
	'MIT': -11,
	'HST': -10,
	'AST': -9,
	'PST': -8,
	'PNT': -7,
	'MST': -7,
	'CST': -6,
	'CDT': -5, // daylight savings time
	'EST': -5,
	'IET': -5,
	'PRT': -4,
	'CNT': -3.5,
	'AGT': -3,
	'BET': -3,
}

function to24h(hour, ampm) {
	// 1am = 
	if (ampm == 'pm' && hour < 12)
		hour += 12
	if (ampm == 'am' && hour == 12)
		hour -= 12
	return hour
}

function from24h(hour) {
	const ampm = hour >= 12 ? 'pm' : 'am'
	hour %= 12
	if (hour < 1) hour += 12
	return { ampm, hour }
}

export async function request(query) {
	const regexMatch = query.match(timezoneRegex)
	if (!regexMatch) return {}
	let fromHour = parseInt(regexMatch[1])
	const fromMinute = parseInt(regexMatch[2] || '0')
	const fromAMPM = (regexMatch[3] || '').toLowerCase()
	const fromTimezone = regexMatch[4].toUpperCase()
	const fromOffset = timezones[fromTimezone]
	if (fromOffset === undefined) return {}

	const toTimezone = regexMatch[5].toUpperCase()
	const toOffset = timezones[toTimezone]
	if (toOffset === undefined) return {}
	const totalOffset = toOffset - fromOffset


	if (fromAMPM)
		// if it has am/pm, make it a 24 hour time
		fromHour = to24h(fromHour, fromAMPM)

	const fromTimeString = `${fromHour % 12 || 12}:${('0' + fromMinute).slice(-2)}${fromAMPM}`


	fromHour += fromMinute / 60 // add the minute as a decimal
	
	let { ampm: toAMPM, hour: toHour } = from24h(fromHour + totalOffset)
	const toMinutes = Math.round((toHour - Math.floor(toHour)) * 60)
	toHour -= (toMinutes / 60)

	const toTimeString = `${toHour}:${('0' + toMinutes).slice(-2)}${toAMPM}`

	let aheadBehindString = ''
	aheadBehindString += `${fromTimezone} is `
	if (Math.floor(totalOffset) == 1) aheadBehindString += '1 hour '
	else if (Math.floor(totalOffset) == -1) aheadBehindString += '1 hour '
	else aheadBehindString += `${Math.floor(totalOffset)} hours `
	if (totalOffset - Math.floor(totalOffset) > 0) {
		const aheadBehindMinutes = Math.floor((totalOffset - Math.floor(totalOffset)) * 60)
		aheadBehindString += `and ${aheadBehindMinutes} minutes `
	}

	if (totalOffset >= 0)
		aheadBehindString += 'behind '
	else
		aheadBehindString += 'ahead of '
	aheadBehindString += toTimezone

	return {
		answer: {
			content: `<h3>${fromTimeString} ${fromTimezone} = ${toTimeString} ${toTimezone}</h3>\n${aheadBehindString}`,
			template: 'html'
		}
	}
}

export const weight = 2
