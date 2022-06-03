const commonWords = require('../../../src/common-words.json')
import { requestDom, extractText, getElements } from '../../parser'

const defineRegex = /^(?:define )(.+)$/i

interface DictionaryConfig {
	containerPath: string
	wordNamePath: string
	phoneticSpellingPath: string
	ipaSpellingPath: string
	entryPaths: string
	partOfSpeechPath: string
	entryDefinitionsPath: string
	definitionPath: string
	definitionLabelPath: string
}

interface DictionaryEntryDefinition {
	label: string
	definition: string
}

interface DictionaryEntry {
	partOfSpeech: string
	definitions: DictionaryEntryDefinition[]
}

interface DictionaryResponse {
	word: string
	phoneticSpelling: string
	ipaSpelling: string
	entries: DictionaryEntry[]
	url: string
}

async function parseDictionary(url, {
	containerPath,
	wordNamePath,
	phoneticSpellingPath,
	ipaSpellingPath,
	entryPaths,
	partOfSpeechPath,
	entryDefinitionsPath,
	definitionPath,
	definitionLabelPath,
}: DictionaryConfig): Promise<DictionaryResponse> {
	const dom: cheerio.Root = await requestDom(url)
	
	const body: cheerio.Cheerio = dom(containerPath)

	const wordName = extractText(body, wordNamePath)
	const phoneticSpelling = extractText(body, phoneticSpellingPath)
	const ipaSpelling = extractText(body, ipaSpellingPath)

	const entries: DictionaryEntry[] = []

	for (const entryEl of getElements(body, entryPaths)) {
		const partOfSpeech = extractText(entryEl, partOfSpeechPath)

		const entryDefinitions: DictionaryEntryDefinition[] = []
		
		for (const definitionEl of getElements(entryEl, entryDefinitionsPath)) {
			const definition = extractText(definitionEl, definitionPath)
			const label = extractText(definitionEl, definitionLabelPath)

			entryDefinitions.push({
				label,
				definition
			})
		}
		entries.push({
			partOfSpeech,
			definitions: entryDefinitions
		})
	}

	return {
		word: wordName,
		phoneticSpelling,
		ipaSpelling,
		entries,
		url
	}
}

/** Search dictionary.com, this is kinda broken */
async function dictionaryCom(query: string): Promise<DictionaryResponse> {
	return await parseDictionary('https://www.dictionary.com/browse/' + encodeURI(query), {
		containerPath: 'section.serp-nav-button + div',
		wordNamePath: 'section.entry-headword > div > div h1',
		phoneticSpellingPath: 'section.entry-headword span.pron-spell-content',
		ipaSpellingPath: '.pron-ipa-content',

		entryPaths: 'section.entry-headword ~ section',
		partOfSpeechPath: '.luna-pos',
		entryDefinitionsPath: 'section > div > div[value], .default-content > div[value], h3 + div > div[value]',
		definitionPath: 'div[value] > span.one-click-content:last-of-type',
		definitionLabelPath: '.luna-label',
	})
}


function matchWord(query) {
	const regexMatch = query.match(defineRegex)
	if (regexMatch)
		return regexMatch[1]
	else if (!query.includes(' ') && !commonWords.includes(query))
		return query
	return {}
}

export async function request(query) {
	const inputtedWord = matchWord(query)
	if (!inputtedWord) return {}
	let { word, phoneticSpelling, ipaSpelling, entries, url } = await dictionaryCom(inputtedWord)
	if (!word) return {}
	return {
		answer: {
			template: 'dictionary',
			word,
			phoneticSpelling,
			ipaSpelling,
			entries,
			url 
		}
	}
}
