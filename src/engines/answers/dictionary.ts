const commonWords = require('../../common-words.json')
import { requestDom, extractText, getElements } from '../../parser'

const defineRegex = /^(?:define )(.+)$/i

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
}) {
	const dom = await requestDom(url)
	
	const body = dom(containerPath)

	const wordName = extractText(body, wordNamePath)
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
		containerPath: 'section.e1hj943x0 > div.e16867sm0:first-of-type',
		wordNamePath: 'section.entry-headword h1.e1wg9v5m3',
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
