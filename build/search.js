"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runPlugin = exports.autocomplete = exports.request = void 0;
const normalize_url_1 = __importDefault(require("./normalize-url"));
const perf_hooks_1 = require("perf_hooks");
const require_dir_1 = __importDefault(require("require-dir"));
const recursedEngines = (0, require_dir_1.default)('./engines', { recurse: true });
const engines = {};
const debugPerf = false;
const plugins = recursedEngines.plugins;
Object.assign(engines, recursedEngines.answers, recursedEngines.search);
// add "name" to all engines
for (const engineName in engines)
    engines[engineName].name = engineName;
async function requestEngine(engineName, query, req) {
    const engine = engines[engineName];
    let perfBefore, perfAfter;
    if (debugPerf || req.debug)
        perfBefore = perf_hooks_1.performance.now();
    const response = await engine.request(query, req);
    if (debugPerf || req.debug) {
        perfAfter = perf_hooks_1.performance.now();
        if (debugPerf)
            console.log(`${engineName} took ${Math.floor(perfAfter - perfBefore)}ms.`);
        response.time = Math.floor(perfAfter - perfBefore);
    }
    response.engine = engine;
    return response;
}
async function requestAllEngines(query, req) {
    const promises = [];
    for (const engineName in engines) {
        const engine = engines[engineName];
        if (engine.request)
            promises.push(requestEngine(engineName, query, req));
    }
    const resolvedRequests = await Promise.all(promises);
    const results = {};
    for (const engineIndex in resolvedRequests) {
        const engineName = Object.keys(engines)[engineIndex];
        results[engineName] = resolvedRequests[engineIndex];
    }
    return results;
}
async function requestAllAutoCompleteEngines(query) {
    if (!query)
        return {};
    const promises = [];
    for (const engineName in engines) {
        const engine = engines[engineName];
        if (engine.autoComplete)
            promises.push(engine.autoComplete(query));
    }
    const resolvedRequests = await Promise.all(promises);
    const results = {};
    for (const engineIndex in resolvedRequests) {
        const engineName = Object.keys(engines)[engineIndex];
        results[engineName] = resolvedRequests[engineIndex];
    }
    return results;
}
/** Sort an array by how frequently items are repeated, and based on their weight */
function sortByFrequency(items) {
    const occurencesMap = new Map();
    for (const item of items) {
        if (occurencesMap.has(item.value))
            occurencesMap.set(item.value, occurencesMap.get(item.value) + item.weight);
        else
            occurencesMap.set(item.value, item.weight);
    }
    const occurencesMapSorted = new Map([...occurencesMap.entries()]
        .sort(([a, numberA], [b, numberB]) => numberB - numberA));
    return Array.from(occurencesMapSorted.keys());
}
async function request(query, req) {
    var _a, _b, _c;
    const results = {};
    const enginesResults = await requestAllEngines(query, req);
    let answer = null;
    let sidebar = null;
    let suggestions = [];
    for (const engineName in enginesResults) {
        const engine = engines[engineName];
        const engineWeight = (_a = engine.weight) !== null && _a !== void 0 ? _a : 1;
        const engineResponse = enginesResults[engineName];
        const engineAnswer = engineResponse.answer;
        const engineSidebarAnswer = engineResponse.sidebar;
        const answerEngineWeight = (_c = (_b = answer === null || answer === void 0 ? void 0 : answer.engine) === null || _b === void 0 ? void 0 : _b.weight) !== null && _c !== void 0 ? _c : 1;
        if (engineAnswer && ((engineWeight > answerEngineWeight) || !answer)) {
            answer = engineAnswer;
            answer.engine = engine;
        }
        if (engineSidebarAnswer !== undefined && (!sidebar || !sidebar.engine || (sidebar.engine.weight && engineWeight > sidebar.engine.weight))) {
            sidebar = engineSidebarAnswer;
            sidebar.engine = engine;
        }
        if (engineResponse.suggestion) {
            suggestions.push({
                value: engineResponse.suggestion,
                weight: engineWeight
            });
        }
        for (const result of engineResponse.results || []) {
            let normalUrl;
            try {
                normalUrl = (0, normalize_url_1.default)(result.url);
            }
            catch {
                console.log('Invalid URL!', result, engineName);
                continue;
            }
            // Default values
            if (!results[normalUrl]) {
                results[normalUrl] = {
                    url: normalUrl,
                    title: result.title,
                    content: result.content,
                    score: 0,
                    weight: engineWeight,
                    engines: []
                };
            }
            // position 1 is score 1, position 2 is score .5, position 3 is score .333, etc
            if (results[normalUrl].weight < engineWeight) {
                // if the weight of this engine is higher than the previous one, replace the title and content
                results[normalUrl].title = result.title;
                results[normalUrl].content = result.content;
            }
            results[normalUrl].score += engineWeight / result.position;
            // for some reason the engine will be there twice, not sure why, for example first result for "mat does dev" has google twice
            if (!results[normalUrl].engines.includes(engineName))
                results[normalUrl].engines.push(engineName);
        }
    }
    const calculatedResults = Object.values(results).sort((a, b) => b.score - a.score).filter((result) => result.url !== (answer === null || answer === void 0 ? void 0 : answer.url));
    const suggestionsSorted = sortByFrequency(suggestions);
    const suggestion = suggestionsSorted.length >= 1 ? suggestionsSorted[0] : null;
    // do some last second modifications, if necessary, and return the results!
    return await requestAllPlugins({
        results: calculatedResults,
        answer,
        sidebar,
        suggestion,
        debug: req.debug,
        engines: Object.values(enginesResults),
        plugins: {} // these will be modified by plugins()
    });
}
exports.request = request;
async function autocomplete(query) {
    var _a;
    const enginesResults = await requestAllAutoCompleteEngines(query);
    const weightedItems = [];
    for (const engineName in enginesResults) {
        const engine = engines[engineName];
        for (let position = 0; position < enginesResults[engineName].length; position++)
            weightedItems.push({
                value: enginesResults[engineName][position],
                weight: ((_a = engine.weight) !== null && _a !== void 0 ? _a : 1) / (position + 1)
            });
    }
    return sortByFrequency(weightedItems).slice(0, 10);
}
exports.autocomplete = autocomplete;
// do some last second non-http modifications to the results
async function requestAllPlugins(options) {
    for (const pluginName in plugins) {
        const plugin = plugins[pluginName];
        if (plugin.changeOptions)
            options = await plugin.changeOptions(options);
    }
    return options;
}
async function runPlugin({ pluginName, options }) {
    return await plugins[pluginName].runPlugin(options);
}
exports.runPlugin = runPlugin;
