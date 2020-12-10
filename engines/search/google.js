const { parseResultList, requestJSON, getElements } = require('../../parser')


async function request(query) {
	return await parseResultList('https://www.google.com/search?pws=0&q=' + encodeURIComponent(query), {
		resultItemPath: 'div.g',
		titlePath: 'h3 > span',
		hrefPath: 'div.yuRUbf > a[href], h3.H1u2de > a[href]',
		contentPath: 'div.IsZvec',
		suggestionPath: 'p.card-section a:first-of-type',

		featuredSnippetPath: '.c2xzTb',
		featuredSnippetContentPath: '.hgKElcm, .X5LH0c',
		featuredSnippetTitlePath: 'div.rc a > h3',
		featuredSnippetHrefPath: 'div.rc a',
	})
}

async function autoComplete(query) {
	if (!query.trim()) return []
	const data = await requestJSON('https://suggestqueries.google.com/complete/search?output=firefox&client=firefox&hl=US-en&q=' + query)
	const results = []
	for (const suggestion of data[1])
		results.push(suggestion)
	return results
}


module.exports.weight = 1.05
module.exports.request = request
module.exports.autoComplete = autoComplete


