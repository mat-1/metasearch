const { parseResultList } = require('../../parser')


async function request(query) {
	return await parseResultList('https://google.com/search?pws=0&q=' + encodeURIComponent(query), {
		resultItemPath: 'div.g',
		titlePath: 'h3 > span',
		hrefPath: 'div.yuRUbf > a[href]',
		contentPath: 'div.IsZvec',
		suggestionPath: 'p.card-section a:first-of-type',

		featuredSnippetPath: '.c2xzTb',
		featuredSnippetContentPath: '.hgKElc',
		featuredSnippetTitlePath: 'div.rc a > h3',
		featuredSnippetHrefPath: 'div.rc a',
	})
}

module.exports.weight = 1.05
module.exports.request = request