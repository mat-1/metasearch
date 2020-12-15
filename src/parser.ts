import { EngineRequest } from './search'
import * as fetch from 'node-fetch'
import * as cheerio from 'cheerio'
import { Agent } from 'https'

const httpsAgent = new Agent({
	keepAlive: true
})


export async function requestRaw(url) {
	const response = await fetch(url, {
		headers: {
			'user-agent': 'Mozilla/5.0 Firefox/84.0'
		},
		agent: () => httpsAgent
	})
	const text = await response.buffer()
	return text
}

export async function requestJSON(url) {
	return JSON.parse(await requestRaw(url))
}

export async function requestDom(url) {
	const htmlResponse = await requestRaw(url)
	return cheerio.load(htmlResponse)
}

export function get(dom, query) {
	if (dom.find) { return dom.find(query) } else { return dom(query) }
}

export function getElements(dom, query) {
	const elements = get(dom, query)
	const results = []

	for (const element of elements.get()) {
		results.push(get(dom, element))
	}
	return results
}

export function extractText(dom, query) {
	const element = get(dom, query)
	if (element[0] && element[0].name === 'ol') {
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

// for google, bing, etc
export async function parseResultList(url, options = {} as ParseResultListOptions): Promise<EngineRequest> {
	const $ = await requestDom(url)

	const results = []

	const resultElements = getElements($, options.resultItemPath)

	let featuredSnippetContent = null
	let featuredSnippetTitle = null
	let featuredSnippetUrl = null

	for (const resultItemIndex in resultElements) {
		const resultItemEl = resultElements[resultItemIndex]
		const resultTitle = extractText(resultItemEl, options.titlePath)
		if (!resultTitle) continue
		const resultUrl = extractHref(resultItemEl, options.hrefPath)
		if (resultUrl.startsWith('https://duckduckgo.com/y.js')) { continue }
		const resultContent = extractText(resultItemEl, options.contentPath)

		if (options.featuredSnippetPath) {
			const featuredSnippetEl = $(options.featuredSnippetPath)
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
	return {
		results,
		answer: featuredSnippetContent !== null
		? {
			content: featuredSnippetContent,
			title: featuredSnippetTitle,
			url: featuredSnippetUrl
		}
		: null
	}
}

