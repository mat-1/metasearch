"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.request = void 0;
const parser_1 = require("../../parser");
const cssRegex = /^(?:(?:css ([a-z-]+))|(?:([a-z-]+) css))$/i;
const htmlRegex = /^(?:(?:html ([a-z-]+))|(?:([a-z-]+) html))$/i;
const apiRegex = /^(?:(?:(?:js )?([a-z ]+) api)|(?:([a-z ]+) (?:js )?api))$/i;
const jsRegex = /^(?:(?:js ?([a-z ]+))|(?:([a-z ]+)  js))$/i;
async function makeSidebarResponse(urlPart) {
    const url = `https://developer.mozilla.org/en-US/docs/Web/${urlPart}`;
    const dom = (await parser_1.requestDom(url))('html');
    if (parser_1.extractText(dom, 'h1') === 'Page not found')
        return {};
    const firstParagraph = parser_1.extractText(dom, 'article p');
    if (!firstParagraph)
        return {};
    return {
        sidebar: {
            title: parser_1.extractText(dom, 'h1'),
            content: firstParagraph,
            url,
        }
    };
}
async function request(query) {
    var _a, _b, _c, _d;
    let match;
    match = query.match(cssRegex);
    if (match)
        return await makeSidebarResponse(`CSS/${(_a = match[1]) !== null && _a !== void 0 ? _a : match[2]}`);
    match = query.match(htmlRegex);
    if (match)
        return await makeSidebarResponse(`HTML/Element/${(_b = match[1]) !== null && _b !== void 0 ? _b : match[2]}`);
    match = query.match(apiRegex);
    if (match)
        return await makeSidebarResponse(`API/${((_c = match[1]) !== null && _c !== void 0 ? _c : match[2]).replace(/ /g, '_')}`);
    match = query.match(jsRegex);
    if (match)
        return await makeSidebarResponse(`JavaScript/${((_d = match[1]) !== null && _d !== void 0 ? _d : match[2]).replace(/ /g, '_')}`);
    return {};
}
exports.request = request;
