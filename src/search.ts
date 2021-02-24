import normalizeUrl from './normalize-url'
import * as requireDir from 'require-dir'
import { performance } from 'perf_hooks'
import type { Request as ExpressRequest } from 'express'

export interface EngineResult {
	url: string,
	title: string,
	content: string,
	position: number
}

interface InstantAnswer {
	content: string,
	title: string,
	url: string
}

interface SidebarAnswer {
	title: string
	content: string
	image: string
	url: string
}

export interface EngineResponse {
	results?: EngineResult[],
	answer?: InstantAnswer,
	sidebar?: SidebarAnswer
	suggestion?: string
	time?: number
}

interface Engine {
	name?: string
	request?: Function
	autoComplete?: Function
	weight?: number
}

const recursedEngines = requireDir('./engines', { recurse: true })
const engines: { [engineName: string]: Engine } = {}

const debugPerf: boolean = true

const plugins = recursedEngines.plugins

Object.assign(
	engines,
	recursedEngines.answers,
	recursedEngines.search
)

// add "name" to all engines
for (const engineName in engines)
	engines[engineName].name = engineName


async function requestEngine(engineName: string, query: string, req: ExpressRequest): Promise<EngineResponse> {
	const engine: Engine = engines[engineName]
	let perfBefore: number, perfAfter: number
	perfBefore = performance.now()
	const response: EngineResponse = await engine.request(query, req)
	perfAfter = performance.now()
	if (debugPerf)
		console.log(`${engineName} took ${Math.floor(perfAfter - perfBefore)}ms.`)
	response.time = Math.floor(perfAfter - perfBefore)
	return response
}

async function requestAllEngines(query: string, req: ExpressRequest): Promise<{[engineName: string]: EngineResponse}> {
	const promises: Promise<EngineResponse>[] = []
	for (const engineName in engines) {
		const engine: Engine = engines[engineName]
		if (engine.request) promises.push(requestEngine(engineName, query, req))
	}
	const resolvedRequests: EngineResponse[] = await Promise.all(promises)
	const results: {[engineName: string]: EngineResponse} = {}
	for (const engineIndex in resolvedRequests) {
		const engineName = Object.keys(engines)[engineIndex]
		results[engineName] = resolvedRequests[engineIndex]
	}
	return results
}

async function requestAllAutoCompleteEngines(query) {
	if (!query) return []
	const promises = []
	for (const engineName in engines) {
		const engine = engines[engineName]
		if (engine.autoComplete) { promises.push(engine.autoComplete(query)) }
	}
	const resolvedRequests = await Promise.all(promises)
	const results = {}
	for (const engineIndex in resolvedRequests) {
		const engineName = Object.keys(engines)[engineIndex]
		results[engineName] = resolvedRequests[engineIndex]
	}
	return results
}

/** Sort an array by how frequently items are repeated, and based on their weight */
function sortByFrequency(items: WeightedValue[]): any[] {
	const occurencesMap: Map<any, number> =  new Map()
	for (const item of items) {
		if (occurencesMap.has(item.value))
			occurencesMap.set(item.value, occurencesMap.get(item.value) + item.weight)
		else
			occurencesMap.set(item.value, item.weight)
	}

	const occurencesMapSorted = new Map([...occurencesMap.entries()].sort(([a, numberA], [b, numberB]) => {
		return numberB - numberA
	}))

	return Array.from(occurencesMapSorted.keys())
}

interface WeightedValue {
	weight: number
	value: any
}

async function request(query: string, req: ExpressRequest) {
	const results = {}
	const enginesResults = await requestAllEngines(query, req)
	let answer: any = {}
	let sidebar: any = {}
	let suggestions: WeightedValue[] = []

	const slowEngines = {}

	for (const engineName in enginesResults) {
		const engine: Engine = engines[engineName]
		const engineWeight: number = engine.weight || 1
		const engineResponse: EngineResponse = enginesResults[engineName]

		const engineAnswer = engineResponse.answer
		const engineSidebarAnswer = engineResponse.sidebar
		const answerEngineWeight = answer.engine ? answer.engine.weight || 1 : 0

		if (engineAnswer && ((engineWeight > answerEngineWeight) || Object.keys(answer).length === 0)) {
			answer = engineAnswer
			answer.engine = engine
		}
		if (engineSidebarAnswer !== undefined && (!sidebar.engine || (sidebar.engine.weight && engineWeight > sidebar.engine.weight))) {
			sidebar = engineSidebarAnswer
			sidebar.engine = engine
		}
		if (engineResponse.suggestion) {
			suggestions.push({
				value: engineResponse.suggestion,
				weight: engineWeight
			})
		}

		for (const result of engineResponse.results || []) {
			let normalUrl
			try {
				normalUrl = normalizeUrl(result.url)
			} catch {
				console.log('Invalid URL!', result, engineName)
				continue
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
				}
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

		if (engineResponse.time > 1000) {
			slowEngines[engineName] = engineResponse.time
		}
	}

	const calculatedResults = Object.values(results).sort((a: any, b: any) => b.score - a.score).filter((result: any) => result.url !== answer.url)
	const suggestionsSorted = sortByFrequency(suggestions)
	const suggestion = suggestionsSorted.length >= 1 ? suggestionsSorted[0] : null

	// do some last second modifications, if necessary, and return the results!
	return await requestAllPlugins({
		results: calculatedResults,
		answer,
		sidebar,
		suggestion,
		slowEngines,

		plugins: {} // these will be modified by plugins()
	})
}

async function autocomplete(query) {
	const results = {}
	const enginesResults = await requestAllAutoCompleteEngines(query)
	for (const engineName in enginesResults) {
		const engine = engines[engineName]
		const engineResults = enginesResults[engineName]
		let resultPosition = 0
		for (const result of engineResults) {
			const engineWeight = engine.weight || 1
			resultPosition ++

			// Default values
			if (!results[result]) {
 				results[result] = {
					result,
					score: 0,
					weight: engineWeight,
					engines: []
				}
			}

			results[result].score += engineWeight / resultPosition
			results[result].engines.push(engineName)
		}
	}
	return Object.keys(results)
}

// do some last second non-http modifications to the results
async function requestAllPlugins(options: any) {
	for (const pluginName in plugins) {
		const plugin = plugins[pluginName]
		if (plugin.changeOptions) { options = await plugin.changeOptions(options) }
	}
	return options
}

async function runPlugin({ pluginName, options }) {
	return await plugins[pluginName].runPlugin(options)
}

export { request, autocomplete, runPlugin }
