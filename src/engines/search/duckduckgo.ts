import { parseResultList } from '../../parser'

export async function request(query) {
	return await parseResultList('https://html.duckduckgo.com/html?q=' + encodeURIComponent(query), {
		resultItemPath: '.result',
		titlePath: 'h2',
		hrefPath: 'h2 > a',
		contentPath: '.result__snippet'
	})
}
