import { parseResultList } from '../../parser'
import { EngineRequest } from '../../search'

export async function request(query): Promise<EngineRequest> {
	return await parseResultList('https://www.bing.com/search?q=' + encodeURIComponent(query), {
		resultItemPath: '#b_results > li.b_algo',
		titlePath: '.b_algo > h2 > a',
		hrefPath: '.b_algo > h2 > a[href]',
		contentPath: '.b_caption > p',

		suggestionPath: 'li.b_ans > #sp_requery > a[href] > strong',
	})
}

export const weight = 1.0
