const { parseResultList, requestDom, getElements } = require('../../parser')


async function request(query) {
	return await parseResultList('https://google.com/search?pws=0&q=' + encodeURIComponent(query), {
		resultItemPath: 'div.g',
		titlePath: 'h3 > span',
		hrefPath: 'div.yuRUbf > a[href], h3.H1u2de > a[href]',
		contentPath: 'div.IsZvec',
		suggestionPath: 'p.card-section a:first-of-type',

		featuredSnippetPath: '.c2xzTb',
		featuredSnippetContentPath: '.hgKElc',
		featuredSnippetTitlePath: 'div.rc a > h3',
		featuredSnippetHrefPath: 'div.rc a',
	})
}

async function autoComplete(query) {
	const dom = await requestDom('https://suggestqueries.google.com/complete/search?client=toolbar&q=' + query)
	const results = []
	for (const suggestion of getElements(dom, 'suggestion'))
		results.push(suggestion.attr('data'))
	return results
}


module.exports.weight = 1.05
module.exports.request = request
module.exports.autoComplete = autoComplete


