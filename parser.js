const fetch = require("node-fetch")
const cheerio = require('cheerio')

async function requestRaw(url) {
	const response = await fetch(url, {
		headers: {
			'user-agent': 'Mozilla/5.0 Firefox/84.0'
		}
	})
	return await response.text()
}

async function requestDom(url) {
	const htmlResponse = await requestRaw(url)
	return cheerio.load(htmlResponse)
}

function getElements(dom, query) {
	const elements = dom(query)
	const results = []

	for (const element of elements.get()) {
		results.push(dom(resultItelementemEl))
	}
	return results
}

function extractText(dom, query) {
	const element = dom.find(query)
	return titleEl.text()
}

// for google, bing, etc
async function parseResultList(url, {resultItemPath, titlePath}) {
	const results = []
	const resultListEls = $(resultItemPath)

	for (const resultItemEl of getElements($, resultItemPath)) {
		const title = extractText(resultItemEl, titlePath)
		if (!title) continue

		console.log(title)
	}
}

parseResultList('https://google.com/search?q=matdoesdev', {
	resultItemPath: 'div.g',
	titlePath: 'h3'
})