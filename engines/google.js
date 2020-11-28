const { parseResultList } = require('../parser')

const weight = 1.05

async function request(query) {
	return await parseResultList('https://google.com/search?pws=0&q=' + encodeURIComponent(query), {
		resultItemPath: 'div.g',
		titlePath: 'h3 > span',
		hrefPath: 'div.yuRUbf > a[href]',
		contentPath: 'div.IsZvec',
		suggestionPath: 'p.card-section a:first-of-type',

		featuredSnippetPath: '.ifM9O',
		featuredSnippetContentPath: '.hgKElc',
		featuredSnippetTitlePath: 'div.rc a > h3',
		featuredSnippetHrefPath: 'div.rc a',
	})
}

module.exports = { request, weight }