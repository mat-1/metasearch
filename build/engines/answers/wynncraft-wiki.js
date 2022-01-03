"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.request = void 0;
const parser_1 = require("../../parser");
const wynncraftRegex = /^(?:wynn(?:craft)?)?\s*?([^<>]+?)\s*(?:wynn(?:craft)?)?$/i;
async function request(query) {
    const regexMatch = query.match(wynncraftRegex);
    if (!regexMatch)
        return {};
    let wynncraftQuery = regexMatch[1] + ' (Quest)';
    wynncraftQuery = wynncraftQuery.replace(/(^\w{1})|(\s+\w{1})(?=\w{2})/g, letter => letter.toUpperCase());
    const summaryJson = await (0, parser_1.requestJSON)('https://wynncraft.gamepedia.com/api.php?format=json&action=query&prop=extracts&exintro&explaintext&redirects=1&titles=' + encodeURIComponent(wynncraftQuery));
    const pages = summaryJson.query.pages;
    const pageId = Object.keys(pages)[0];
    if (pageId == '-1')
        return {};
    const article = pages[pageId];
    return {
        sidebar: {
            title: article.title,
            content: article.extract,
            image: '/wynncraft.webp',
            url: 'https://wynncraft.gamepedia.com/' + article.title.replace(' ', '_')
        }
    };
}
exports.request = request;
