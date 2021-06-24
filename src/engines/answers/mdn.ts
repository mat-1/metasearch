import { EngineResponse } from '../../search'
import { extractText, requestDom } from '../../parser'

const cssRegex = /^(?:(?:css ([a-z-]+))|(?:([a-z-]+) css))$/i
const htmlRegex = /^(?:(?:html ([a-z-]+)(?: element)?)|(?:([a-z-]+)(?: element)? html))$/i

const apiRegex = /^(?:(?:(?:js |javascript )?([a-z ]+) api)|(?:([a-z ]+) (?:js |javascript )?api))$/i
// "js closures"
const jsRegex = /^(?:(?:(?:js|javascript) ?([a-z ]+))|(?:([a-z ]+) (?:js|javascript)))$/i
// "js what are closures"
const jsRegex2 = /^(?:(?:(?:js|javascript)(?: what( is|'s|s| are|'re))? ?([a-z ]+))|(?:what( is|'s|s| are|'re))? (?:([a-z ]+) (?:in )?(?:js|javascript)))$/i

async function makeSidebarResponse(urlPart: string): Promise<EngineResponse> {
	const url = `https://developer.mozilla.org/en-US/docs/Web/${urlPart}`
	const dom = (await requestDom(url))('html')
	if (extractText(dom, 'h1') === 'Page not found') return {}
	const firstParagraph = extractText(dom, 'article p')
	if (!firstParagraph) return {}
	return {
		sidebar: {
			title: extractText(dom, 'h1'),
			content: firstParagraph,
			url,
		}
	}
}

export async function request(query: string): Promise<EngineResponse> {
	let match: RegExpMatchArray | null

	match = query.match(cssRegex)
	if (match) return await makeSidebarResponse(`CSS/${match[1] ?? match[2]}`)

	match = query.match(htmlRegex)
	if (match) return await makeSidebarResponse(`HTML/Element/${match[1] ?? match[2]}`)

	match = query.match(apiRegex)
	if (match) return await makeSidebarResponse(`API/${(match[1] ?? match[2]).replace(/ /g, '_')}`)

	match = query.match(jsRegex)
	if (match) return await makeSidebarResponse(`JavaScript/${(match[1] ?? match[2]).replace(/ /g, '_')}`)
	match = query.match(jsRegex2)
	if (match) return await makeSidebarResponse(`JavaScript/${(match[1] ?? match[2]).replace(/ /g, '_')}`)

	return {}
}
