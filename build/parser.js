"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseResultList = exports.extractHref = exports.extractAttribute = exports.extractText = exports.getElements = exports.get = exports.requestDom = exports.requestJSON = exports.requestRaw = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
const cheerio = __importStar(require("cheerio"));
const https_1 = require("https");
const httpsAgent = new https_1.Agent({
    keepAlive: true,
    keepAliveMsecs: 20000
});
async function requestRaw(url) {
    const response = await node_fetch_1.default(url, {
        headers: {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:87.0) Gecko/20100101 Firefox/87.0'
        },
        agent: () => httpsAgent
    });
    return await response.text();
}
exports.requestRaw = requestRaw;
async function requestJSON(url) {
    return JSON.parse(await requestRaw(url));
}
exports.requestJSON = requestJSON;
async function requestDom(url) {
    const htmlResponse = await requestRaw(url);
    return cheerio.load(htmlResponse);
}
exports.requestDom = requestDom;
function get(dom, query) {
    return dom.find(query);
}
exports.get = get;
function getElements(dom, query) {
    const elements = get(dom, query);
    const results = [];
    for (const element of elements.get()) {
        results.push(get(dom, element));
    }
    return results;
}
exports.getElements = getElements;
function extractText(dom, query) {
    const element = get(dom, query);
    if (element.first && element.first.name === 'ol') {
        // if it's a list, number it and add newlines
        const listTexts = [];
        const listItems = getElements(element, 'li');
        for (const listItemIndex in listItems) {
            const listItem = listItems[listItemIndex];
            const displayedIndex = parseInt(listItemIndex) + 1;
            listTexts.push(displayedIndex + '. ' + listItem.text().trim());
        }
        return listTexts.join('\n');
    }
    return element.first().text().trim();
}
exports.extractText = extractText;
function extractAttribute(dom, query, attribute) {
    var _a;
    const element = get(dom, query);
    return (_a = element.attr(attribute)) !== null && _a !== void 0 ? _a : null;
}
exports.extractAttribute = extractAttribute;
function extractHref(dom, query) {
    return extractAttribute(dom, query, 'href');
}
exports.extractHref = extractHref;
// for search engines like google, bing, etc
async function parseResultList(url, options) {
    const $ = await requestDom(url);
    const body = $('body');
    const results = [];
    const resultElements = getElements(body, options.resultItemPath);
    let featuredSnippetContent = null;
    let featuredSnippetTitle = null;
    let featuredSnippetUrl = null;
    for (const resultItemIndex in resultElements) {
        const resultItemEl = resultElements[resultItemIndex];
        const resultTitle = extractText(resultItemEl, options.titlePath);
        if (!resultTitle)
            continue;
        const resultUrl = extractHref(resultItemEl, options.hrefPath);
        if (!resultUrl || resultUrl.startsWith('https://duckduckgo.com/y.js'))
            continue;
        const resultContent = extractText(resultItemEl, options.contentPath);
        if (options.featuredSnippetPath) {
            const featuredSnippetEl = get(body, options.featuredSnippetPath);
            if (featuredSnippetEl.length > 0) {
                if (options.featuredSnippetContentPath)
                    featuredSnippetContent = extractText(featuredSnippetEl, options.featuredSnippetContentPath);
                if (options.featuredSnippetTitlePath)
                    featuredSnippetTitle = extractText(featuredSnippetEl, options.featuredSnippetTitlePath);
                if (options.featuredSnippetHrefPath)
                    featuredSnippetUrl = extractHref(featuredSnippetEl, options.featuredSnippetHrefPath);
            }
        }
        results.push({
            title: resultTitle,
            url: resultUrl,
            content: resultContent,
            position: parseInt(resultItemIndex) + 1 // starts at 1
        });
    }
    const suggestionText = options.suggestionPath ? extractText(body, options.suggestionPath) : undefined;
    return {
        results,
        answer: featuredSnippetContent !== null
            ? {
                content: featuredSnippetContent,
                title: featuredSnippetTitle !== null && featuredSnippetTitle !== void 0 ? featuredSnippetTitle : undefined,
                url: featuredSnippetUrl !== null && featuredSnippetUrl !== void 0 ? featuredSnippetUrl : undefined
            }
            : undefined,
        suggestion: suggestionText
    };
}
exports.parseResultList = parseResultList;
