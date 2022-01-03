import { parseResultList } from '../../parser'
import { EngineResponse } from '../../search'

export async function request(query): Promise<EngineResponse> {
	return await parseResultList('https://neeva.com/search?q=' + encodeURIComponent(query), {
		// neeva makes us do a redirect if we don't save the cookies
		session: true,

		resultItemPath: '.result-container__wrapper-38pV8',
		titlePath: 'a.lib-doc-title__link-1b9rC[href]',
		hrefPath: 'a.lib-doc-title__link-1b9rC[href]',
		contentPath: '.lib-doc-snippet__component-3ewW6',

		suggestionPath: 'a.result-group-layout__queryCorrectedText-2Uw3R[href]',
	})
}

export const weight = 1.2
