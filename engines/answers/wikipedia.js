const { requestJSON } = require('../../parser')

const wikipediaRegex = /^([^<>]+)$/i


async function request(query) {
	const regexMatch = query.match(wikipediaRegex)
	if (!regexMatch) return {}
	const wikipediaQuery = regexMatch[1]
	const summaryJson = await requestJSON('https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts|pageimages&exintro&explaintext&redirects=1&exsentences=2&titles=' + encodeURIComponent(wikipediaQuery))
	const pages = summaryJson.query.pages
	const pageId = Object.keys(pages)[0]
	const article = pages[pageId]
	if (article.missing !== undefined) return {}
	return {
		sidebar: {
			title: article.title,
			content: article.extract,
			image: article.thumbnail ? article.thumbnail.source : undefined,
			url: 'https://en.wikipedia.org/wiki/' + article.title.replace(' ', '_')
		}
	}
}

module.exports = { request }