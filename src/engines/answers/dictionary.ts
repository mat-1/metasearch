const commonWords = require('../../common-words.json')
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
}: DictionaryConfig) {
	const dom: cheerio.Root = await requestDom(url)
	
	const body: cheerio.Cheerio = dom(containerPath)

	const wordName = extractText(body, wordNamePath)
	console.log('body', body, 'wordName', wordName)
	const phoneticSpelling = extractText(body, phoneticSpellingPath)
	const ipaSpelling = extractText(body, ipaSpellingPath)

	const entries = []

	for (const entryEl of getElements(body, entryPaths)) {
		const partOfSpeech = extractText(entryEl, partOfSpeechPath)

		const entryDefinitions = []
		
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

async function dictionaryCom(query) {
	return await parseDictionary('https://www.dictionary.com/browse/' + encodeURI(query), {
		containerPath: '.default-content',
		wordNamePath: 'section.entry-headword > div > div h1',
		phoneticSpellingPath: 'section.entry-headword span.pron-spell-content',
		ipaSpellingPath: '.pron-ipa-content',
		entryPaths: 'section.e1hk9ate0',
		partOfSpeechPath: 'h3.e1hk9ate1',
		entryDefinitionsPath: '.e1q3nk1v3',
		definitionPath: '.e1q3nk1v4',
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
	console.log('dictionary', word, phoneticSpelling, ipaSpelling, entries, url)
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
