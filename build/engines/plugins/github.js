"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeOptions = exports.runPlugin = void 0;
const parser_1 = require("../../parser");
const githubHost = 'https://github.com';
async function runPlugin({ author, name }) {
    const url = `${githubHost}/${author}/${name}`;
    const dom = await (0, parser_1.requestDom)(url);
    dom('svg').remove();
    const body = dom('body');
    const readmeEl = (0, parser_1.get)(body, '#readme article');
    const readmeHtml = readmeEl.html();
    if (readmeHtml == null)
        // no readme :(
        return false;
    return {
        html: readmeHtml.trim().replace(/\n/g, '\\n').replace(/`/g, '\\`'),
        url
    };
}
exports.runPlugin = runPlugin;
async function changeOptions(options) {
    if (options.sidebar)
        // an answer was already found, no need to search for one
        return options;
    for (let resultIndex = 0; resultIndex < options.results.length; resultIndex++) {
        const result = options.results[resultIndex];
        // make sure its a github link and one of the top 4 results
        if (result.url.startsWith(githubHost + '/') && resultIndex <= 4) {
            const path = result.url.slice(githubHost.length + 1).split('/');
            if (path.length === 2) {
                const [author, name] = path;
                if (!options.plugins.github)
                    options.plugins.github = {
                        author, name
                    };
            }
        }
    }
    return options;
}
exports.changeOptions = changeOptions;
