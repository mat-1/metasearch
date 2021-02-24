import { EngineRequest, EngineResult } from './search'
import fetch from 'node-fetch'
import * as cheerio from 'cheerio'
import { Agent } from 'https'

const httpsAgent = new Agent({
	keepAlive: true
})


export async function requestRaw(url: string): Promise<string> {
	const response = await fetch(url, {
		headers: {
			'user-agent': 'Mozilla/5.0 Firefox/84.0'
		},
		agent: () => httpsAgent
	})
	return await response.text()
}

export async function requestJSON(url: string): Promise<any> {
	return JSON.parse(await requestRaw(url))
}

export async function requestDom(url): Promise<cheerio.Root> {
	const htmlResponse = await requestRaw(url)
	return cheerio.load(htmlResponse)
}

export function get(dom: cheerio.Cheerio, query: string): cheerio.Cheerio {
	return dom.find(query)
}

export function getElements(dom: cheerio.Cheerio, query: string): cheerio.Cheerio[] {
	const elements: cheerio.Cheerio = get(dom, query)
	const results: cheerio.Cheerio[] = []

	for (const element of elements.get()) {
		results.push(get(dom, element))
	}
	return results
}

export function extractText(dom: cheerio.Cheerio, query: string): string {
	const element = get(dom, query)
	if (element.first && element.first.name === 'ol') {
		// if it's a list, number it and add newlines
		const listTexts = []
		const listItems = getElements(element, 'li')
		for (const listItemIndex in listItems) {
			const listItem = listItems[listItemIndex]
			const displayedIndex = parseInt(listItemIndex) + 1
			listTexts.push(displayedIndex + '. ' + listItem.text().trim())
		}
		return listTexts.join('\n')
	}
	return element.text().trim()
}

export function extractAttribute(dom, query, attribute) {
	const element = get(dom, query)
	return element.attr(attribute)
}

export function extractHref(dom, query) {
	return extractAttribute(dom, query, 'href')
}

interface ParseResultListOptions {
	resultItemPath: string
	titlePath: string
	hrefPath: string
	contentPath: string
	suggestionPath?: string

	featuredSnippetPath?: string
	featuredSnippetContentPath?: string
	featuredSnippetTitlePath?: string
	featuredSnippetHrefPath?: string
}

// for search engines like google, bing, etc
export async function parseResultList(url, options: ParseResultListOptions): Promise<EngineRequest> {
	const $: cheerio.Root = await requestDom(url)
	const body: cheerio.Cheerio = $('body')

	const results: EngineResult[] = []

	const resultElements = getElements(body, options.resultItemPath)

	let featuredSnippetContent: string = null
	let featuredSnippetTitle: string = null
	let featuredSnippetUrl: string = null

	for (const resultItemIndex in resultElements) {
		const resultItemEl = resultElements[resultItemIndex]
		const resultTitle = extractText(resultItemEl, options.titlePath)
		if (!resultTitle) continue
		const resultUrl = extractHref(resultItemEl, options.hrefPath)
		if (resultUrl.startsWith('https://duckduckgo.com/y.js')) { continue }
		const resultContent = extractText(resultItemEl, options.contentPath)

		if (options.featuredSnippetPath) {
			const featuredSnippetEl = get(body, options.featuredSnippetPath)
			if (featuredSnippetEl.length > 0) {
				featuredSnippetContent = extractText(featuredSnippetEl, options.featuredSnippetContentPath)
				featuredSnippetTitle = extractText(featuredSnippetEl, options.featuredSnippetTitlePath)
				featuredSnippetUrl = extractHref(featuredSnippetEl, options.featuredSnippetHrefPath)
			}
		}

		results.push({
			title: resultTitle,
			url: resultUrl,
			content: resultContent,
			position: parseInt(resultItemIndex) + 1 // starts at 1
		})
	}
	const suggestionText: string = options.suggestionPath ? extractText(body, options.suggestionPath) : null
	console.log(url, suggestionText)
	return {
		results,
		answer: featuredSnippetContent !== null
		? {
			content: featuredSnippetContent,
			title: featuredSnippetTitle,
			url: featuredSnippetUrl
		}
		: null,
		suggestion: suggestionText
	}
}

