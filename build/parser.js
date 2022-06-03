"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseResultList = exports.extractHref = exports.extractAttribute = exports.extractText = exports.getElements = exports.get = exports.requestDom = exports.requestJSON = exports.requestRaw = void 0;
const undici_1 = require("undici");
const cheerio = __importStar(require("cheerio"));
let cachedCookies = {};
// clear the cookies every hour
setInterval(() => {
    cachedCookies = {};
}, 60 * 60 * 1000);
async function requestRaw(url, session = false) {
    var _a;
    let attempts = 0;
    let urlObject = new URL(url);
    let cookie = session ? (_a = cachedCookies[urlObject.hostname]) !== null && _a !== void 0 ? _a : {} : {};
    while (attempts < 5) {
        const response = await (0, undici_1.fetch)(url, {
            headers: {
                'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
                'accept-language': 'en-US,en;q=0.5',
                'DNT': '1',
                'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:96.0) Gecko/20100101 Firefox/96.0',
                'cookie': Object.entries(cookie).map(([k, v]) => `${k}=${v}`).join('; ')
            },
            redirect: 'manual',
            dispatcher: new undici_1.Agent({
                keepAliveTimeout: 20000,
                keepAliveMaxTimeout: 20000
            })
        });
        // if it's a redirect, follow it
        if (response.status === 302 || response.status === 301) {
            let location = response.headers.get('location');
            // extract the cookies
            const cookies = response.headers.get('set-cookie');
            if (cookies) {
                // extract the cookies
                for (const c of cookies) {
                    const [name, value] = c.split(';')[0].split('=');
                    // get the expire date
                    let expiresPart = c.split(';').find(s => s.trim().startsWith('expires='));
                    let expiresDate = expiresPart ? new Date(expiresPart.split('=')[1]) : null;
                    // if it's expired, don't save it
                    if (expiresDate && expiresDate < new Date())
                        continue;
                    cookie[name] = value;
                }
            }
            if (location) {
                url = new URL(location, url).toString();
            }
        }
        else {
            if (session)
                cachedCookies[urlObject.hostname] = cookie;
            return await response.text();
        }
        attempts++;
    }
    return '';
}
exports.requestRaw = requestRaw;
async function requestJSON(url) {
    return JSON.parse(await requestRaw(url));
}
exports.requestJSON = requestJSON;
async function requestDom(url, session = false) {
    const htmlResponse = await requestRaw(url, session);
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
    const elementHref = extractAttribute(dom, query, 'href');
    if (elementHref)
        return elementHref;
    const elementText = extractText(dom, query);
    if (elementText.startsWith('https://'))
        return elementText;
    return null;
}
exports.extractHref = extractHref;
// for search engines like google, bing, etc
async function parseResultList(url, options) {
    var _a;
    const $ = await requestDom(url, (_a = options.session) !== null && _a !== void 0 ? _a : false);
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
