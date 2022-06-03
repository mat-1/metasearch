import { EngineResponse, EngineResult } from './search'
import { Agent, fetch } from 'undici'
import * as cheerio from 'cheerio'

let cachedCookies = {}

// clear the cookies every hour
setInterval(() => {
	cachedCookies = {}
}, 60 * 60 * 1000)


export async function requestRaw(url: string, session: boolean=false): Promise<string> {
	let attempts = 0

	let urlObject = new URL(url)

	let cookie = session ? cachedCookies[urlObject.hostname] ?? {} : {}

	while (attempts < 5) {
		const response = await fetch(url, {
			headers: {
				'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
				'accept-language': 'en-US,en;q=0.5',
				'DNT': '1',
				'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:96.0) Gecko/20100101 Firefox/96.0',
				'cookie': Object.entries(cookie).map(([k, v]) => `${k}=${v}`).join('; ')
			},
			redirect: 'manual',
			dispatcher: new Agent({
				keepAliveTimeout: 20000,
				keepAliveMaxTimeout: 20000
			})
		})

		// if it's a redirect, follow it
		if (response.status === 302 || response.status === 301) {
			let location = response.headers.get('location')
			// extract the cookies
			const cookies = response.headers.get('set-cookie')
			if (cookies) {
				// extract the cookies
				for (const c of cookies) {
					const [name, value] = c.split(';')[0].split('=')
					// get the expire date
					let expiresPart = c.split(';').find(s => s.trim().startsWith('expires='))
					let expiresDate = expiresPart ? new Date(expiresPart.split('=')[1]) : null
					// if it's expired, don't save it
					if (expiresDate && expiresDate < new Date()) continue
					cookie[name] = value
				}
			}
			if (location) {
				url = new URL(location, url).toString()
			}
		} else {
			if (session)
				cachedCookies[urlObject.hostname] = cookie
			return await response.text()
		}
		attempts ++
	}
	return ''
}

export async function requestJSON(url: string): Promise<any> {
	return JSON.parse(await requestRaw(url))
}

export async function requestDom(url, session: boolean=false): Promise<cheerio.Root> {
	const htmlResponse = await requestRaw(url, session)
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
		const listTexts: string[] = []
		const listItems = getElements(element, 'li')
		for (const listItemIndex in listItems) {
			const listItem = listItems[listItemIndex]
			const displayedIndex = parseInt(listItemIndex) + 1
			listTexts.push(displayedIndex + '. ' + listItem.text().trim())
		}
		return listTexts.join('\n')
	}
	return element.first().text().trim()
}

export function extractAttribute(dom: cheerio.Cheerio, query: string, attribute: string): string | null {
	const element = get(dom, query)
	return element.attr(attribute) ?? null
}

export function extractHref(dom: cheerio.Cheerio, query: string) {
	const elementHref = extractAttribute(dom, query, 'href')
	if (elementHref)
		return elementHref
	const elementText = extractText(dom, query)
	if (elementText.startsWith('https://'))
		return elementText
	return null
}

interface ParseResultListOptions {
	/** Whether it should remember this cookies into the next request for the same host */
	session?: boolean

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
export async function parseResultList(url: string, options: ParseResultListOptions): Promise<EngineResponse> {
	const $: cheerio.Root = await requestDom(url, options.session ?? false)
	const body: cheerio.Cheerio = $('body')

	const results: EngineResult[] = []

	const resultElements = getElements(body, options.resultItemPath)

	let featuredSnippetContent: string | null = null
	let featuredSnippetTitle: string | null = null
	let featuredSnippetUrl: string | null = null

	for (const resultItemIndex in resultElements) {
		const resultItemEl = resultElements[resultItemIndex]
		const resultTitle = extractText(resultItemEl, options.titlePath)
		if (!resultTitle) continue
		const resultUrl = extractHref(resultItemEl, options.hrefPath)
		if (!resultUrl || resultUrl.startsWith('https://duckduckgo.com/y.js')) continue
		const resultContent = extractText(resultItemEl, options.contentPath)

		if (options.featuredSnippetPath) {
			const featuredSnippetEl = get(body, options.featuredSnippetPath)
			if (featuredSnippetEl.length > 0) {
				if (options.featuredSnippetContentPath) featuredSnippetContent = extractText(featuredSnippetEl, options.featuredSnippetContentPath)
				if (options.featuredSnippetTitlePath) featuredSnippetTitle = extractText(featuredSnippetEl, options.featuredSnippetTitlePath)
				if (options.featuredSnippetHrefPath) featuredSnippetUrl = extractHref(featuredSnippetEl, options.featuredSnippetHrefPath)
			}
		}

		results.push({
			title: resultTitle,
			url: resultUrl,
			content: resultContent,
			position: parseInt(resultItemIndex) + 1 // starts at 1
		})
	}
	const suggestionText: string | undefined = options.suggestionPath ? extractText(body, options.suggestionPath) : undefined
	return {
		results,
		answer: featuredSnippetContent !== null
		? {
			content: featuredSnippetContent,
			title: featuredSnippetTitle ?? undefined,
			url: featuredSnippetUrl ?? undefined
		}
		: undefined,
		suggestion: suggestionText
	}
}

