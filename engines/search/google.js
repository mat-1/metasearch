const { parseResultList } = require('../../parser')


async function request(query) {
	return await parseResultList('https://google.com/search?pws=0&q=' + encodeURIComponent(query), {
		resultItemPath: 'div.g',
		titlePath: 'h3 > span',
		hrefPath: 'div.yuRUbf > a[href]',
		contentPath: 'div.IsZvec',
		suggestionPath: 'p.card-section a:first-of-type',

		featuredSnippetPath: '.c2xzTb, #wp-tabs-container',
		featuredSnippetContentPath: '.hgKElc, .kno-rdesc > div > span:first-of-type',
		featuredSnippetTitlePath: 'div.rc a > h3, h2.kno-ecr-pt',
		featuredSnippetHrefPath: 'div.rc a, .kno-rdesc a',
	})
}

module.exports.weight = 1.05
module.exports.request = request