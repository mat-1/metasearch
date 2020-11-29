const { requestJSON } = require('../../parser')


async function request(query) {
	const summaryJson = await requestJSON('https://en.wikipedia.org/w/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=' + encodeURIComponent(query))
	const pages = summaryJson.query.pages
	const pageId = Object.keys(pages)[0]
	const article = pages[pageId]
	if (article.missing !== undefined) return {}
	return {
		sidebar: {
			title: article.title,
			content: article.extract
		}
	}
}

module.exports = { request }