const timezoneRegex = /^([0-9][1-4]?):?([0-5]?[0-9])? ?(am|pm)? (...) to (...)$/i

timezones = {
	'GMT': 0,
	'UTC': 0,
	'ECT': 1,
	'EET': 2,
	'ART': 2,
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
	'EST': -5,
	'IET': -5,
	'PRT': -4,
	'CNT': -3.5,
	'AGT': -3,
	'BET': -3,
	'CAT': -1
}

function to24h(hour, ampm) {
	// 1am = 
	if (ampm == 'pm' && hours < 12)
		hour = hour + 12
	if (ampm == 'am' && hours == 12)
		hour = hour - 12
	return hour
}

async function request(query) {
	const regexMatch = query.match(timezoneRegex)
	if (!regexMatch) return {}
	console.log(regexMatch)
	const fromHour = parseInt(regexMatch[1])
	const fromMinute = parseInt(regexMatch[2])
	const fromAMPM = (regexMatch[3] || '').toLowerCase()
	const fromTimezone = regexMatch[4].toUpperCase()

	const toTimezone = regexMatch[5].toUpperCase()
	return {}
}

module.exports = { request }
