"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.request = void 0;
const commonWords = require('../../../src/common-words.json');
const parser_1 = require("../../parser");
const defineRegex = /^(?:define )(.+)$/i;
async function parseDictionary(url, { containerPath, wordNamePath, phoneticSpellingPath, ipaSpellingPath, entryPaths, partOfSpeechPath, entryDefinitionsPath, definitionPath, definitionLabelPath, }) {
    const dom = await parser_1.requestDom(url);
    const body = dom(containerPath);
    const wordName = parser_1.extractText(body, wordNamePath);
    const phoneticSpelling = parser_1.extractText(body, phoneticSpellingPath);
    const ipaSpelling = parser_1.extractText(body, ipaSpellingPath);
    const entries = [];
    for (const entryEl of parser_1.getElements(body, entryPaths)) {
        const partOfSpeech = parser_1.extractText(entryEl, partOfSpeechPath);
        const entryDefinitions = [];
        for (const definitionEl of parser_1.getElements(entryEl, entryDefinitionsPath)) {
            const definition = parser_1.extractText(definitionEl, definitionPath);
            const label = parser_1.extractText(definitionEl, definitionLabelPath);
            entryDefinitions.push({
                label,
                definition
            });
        }
        entries.push({
            partOfSpeech,
            definitions: entryDefinitions
        });
    }
    return {
        word: wordName,
        phoneticSpelling,
        ipaSpelling,
        entries,
        url
    };
}
/** Search dictionary.com, this is kinda broken */
async function dictionaryCom(query) {
    return await parseDictionary('https://www.dictionary.com/browse/' + encodeURI(query), {
        containerPath: 'section.serp-nav-button + div',
        wordNamePath: 'section.entry-headword > div > div h1',
        phoneticSpellingPath: 'section.entry-headword span.pron-spell-content',
        ipaSpellingPath: '.pron-ipa-content',
        entryPaths: 'section.entry-headword ~ section',
        partOfSpeechPath: '.luna-pos',
        entryDefinitionsPath: 'section > div > div[value], h3 + div > div[value]',
        definitionPath: 'div[value] > span.one-click-content',
        // was this removed?
        definitionLabelPath: '.luna-label',
    });
}
function matchWord(query) {
    const regexMatch = query.match(defineRegex);
    if (regexMatch)
        return regexMatch[1];
    else if (!query.includes(' ') && !commonWords.includes(query))
        return query;
    return {};
}
async function request(query) {
    const inputtedWord = matchWord(query);
    if (!inputtedWord)
        return {};
    let { word, phoneticSpelling, ipaSpelling, entries, url } = await dictionaryCom(inputtedWord);
    if (!word)
        return {};
    return {
        answer: {
            template: 'dictionary',
            word,
            phoneticSpelling,
            ipaSpelling,
            entries,
            url
        }
    };
}
exports.request = request;
