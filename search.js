const requireDir = require('require-dir')
const normalizeUrl = require('./normalize-url')
const { performance } = require('perf_hooks')

const recursedEngines = requireDir('./engines', {recurse: true})
const engines = {}

const plugins = recursedEngines.plugins

Object.assign(
	engines,
	recursedEngines.answers,
	recursedEngines.search,
)

console.log('plugins', plugins)

async function requestEngine(engineName, query) {
	let engine = engines[engineName]
	// let perfBefore = performance.now()
	let response = await engine.request(query)
	// let perfAfter = performance.now()
	// console.log(`${engineName} took ${Math.floor(perfAfter - perfBefore)}ms.`);
	return response
}

async function requestAllEngines(query) {
	const promises = []
	for (let engineName in engines) {
		let engine = engines[engineName]
		if (engine.request)
			promises.push(requestEngine(engineName, query))
	}
	const resolvedRequests = await Promise.all(promises)
	results = {}
	for (const engineIndex in resolvedRequests) {
		const engineName = Object.keys(engines)[engineIndex]
		results[engineName] = resolvedRequests[engineIndex]
	}
	return results
}

async function requestAllAutoCompleteEngines(query) {
	if (!query) return []
	const promises = []
	for (let engineName in engines) {
		let engine = engines[engineName]
		if (engine.autoComplete)
			promises.push(engine.autoComplete(query))
	}
	const resolvedRequests = await Promise.all(promises)
	results = {}
	for (const engineIndex in resolvedRequests) {
		const engineName = Object.keys(engines)[engineIndex]
		results[engineName] = resolvedRequests[engineIndex]
	}
	return results
}

async function request(query) {
	const results = {}
	const enginesResults = await requestAllEngines(query)
	var answer = {}
	var sidebar = {}
	for (engineName in enginesResults) {
		const engine = engines[engineName]
		const engineResults = enginesResults[engineName]

		const engineAnswer = engineResults.answer
		const engineSidebarAnswer = engineResults.sidebar
		if (engineAnswer != null && (answer.engine && answer.engine.weight || 1 < engine.weight || 1)) {
			answer = engineAnswer
			answer.engine = engine
		}
		if (engineSidebarAnswer != null && (sidebar.engine && sidebar.engine.weight || 1 < engine.weight || 1)) {
			sidebar = engineSidebarAnswer
			sidebar.engine = engine
		}

		for (const result of engineResults.results || []) {
			let normalUrl
			try {
				normalUrl = normalizeUrl(result.url)
			} catch {
				console.log('Invalid URL!', result, engineName)
				continue
			}

			const engineWeight = engine.weight || 1

			// Default values
			if (!results[normalUrl])
				results[normalUrl] = {
					url: normalUrl,
					title: result.title,
					content: result.content,
					score: 0,
					weight: engineWeight,
					engines: []
				}

			// position 1 is score 1, position 2 is score .5, position 3 is score .333, etc

			if (results[normalUrl].weight < engineWeight) {
				// if the weight of this engine is higher than the previous one, replace the title and content
				results[normalUrl].title = result.title
				results[normalUrl].content = result.content
			}
			results[normalUrl].score += engineWeight / result.position
			results[normalUrl].engines.push(engineName)
		}
	}

	let calculatedResults = Object.values(results).sort((a, b) => b.score - a.score).filter((result) => result.url != answer.url)

	// do some last second modifications, if necessary, and return the results!
	return await requestAllPlugins({
		results: calculatedResults,
		answer,
		sidebar,

		plugins: {} // these will be modified by plugins()
	})
}

async function autocomplete(query) {
	const results = {}
	const enginesResults = await requestAllAutoCompleteEngines(query)
	for (engineName in enginesResults) {
		const engine = engines[engineName]
		const engineResults = enginesResults[engineName]
		let resultPosition = 0
		for (const result of engineResults) {
			const engineWeight = engine.weight || 1
			resultPosition ++

			// Default values
			if (!results[result])
				results[result] = {
					result,
					score: 0,
					weight: engineWeight,
					engines: []
				}

			results[result].score += engineWeight / resultPosition
			results[result].engines.push(engineName)
		}
	}
	return Object.keys(results)
}


// do some last second non-http modifications to the results
async function requestAllPlugins(options) {
	for (let pluginName in plugins) {
		let plugin = plugins[pluginName]
		if (plugin.changeOptions)
			options = await plugin.changeOptions(options)
	}
	return options
}

async function runPlugin({ pluginName, options }) {
	return await plugins[pluginName].runPlugin(options)
}

module.exports = { request, autocomplete, runPlugin }
