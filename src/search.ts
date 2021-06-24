import type { Request as ExpressRequest } from 'express'
import normalizeUrl from './normalize-url'
import { performance } from 'perf_hooks'
import requireDir from 'require-dir'

export interface EngineResult {
	url: string,
	title: string,
	content: string,
	position: number
}

export interface InstantAnswer {
	content?: string
	title?: string
	url?: string
	engine?: Engine
}

interface SidebarAnswer {
	title: string
	content: string
	image?: string
	url: string
	engine?: Engine
}

export interface EngineResponse {
	engine?: Engine
	results?: EngineResult[]
	answer?: InstantAnswer
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

const debugPerf: boolean = false

const plugins = recursedEngines.plugins

Object.assign(
	engines,
	recursedEngines.answers,
	recursedEngines.search
)

// add "name" to all engines
for (const engineName in engines)
	engines[engineName].name = engineName


export interface RequestOptions {
	req: ExpressRequest
	debug: boolean
	hostname: string
	theme: string
}

async function requestEngine(engineName: string, query: string, req: RequestOptions): Promise<EngineResponse> {
	const engine: Engine = engines[engineName]
	let perfBefore: number, perfAfter: number
	if (debugPerf || req.debug)
		perfBefore = performance.now()
	const response: EngineResponse = await engine.request!(query, req)
	if (debugPerf || req.debug) {
		perfAfter = performance.now()
		if (debugPerf) console.log(`${engineName} took ${Math.floor(perfAfter - perfBefore!)}ms.`)
		response.time = Math.floor(perfAfter - perfBefore!)
	}
	response.engine = engine
	return response
}

async function requestAllEngines(query: string, req: RequestOptions): Promise<{[engineName: string]: EngineResponse}> {
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
	if (!query) return {}
	const promises: Promise<string[]>[] = []
	for (const engineName in engines) {
		const engine = engines[engineName]
		if (engine.autoComplete)
			promises.push(engine.autoComplete(query))
	}
	const resolvedRequests = await Promise.all(promises)
	const results: Record<string, string[]> = {}
	for (const engineIndex in resolvedRequests) {
		const engineName = Object.keys(engines)[engineIndex]
		results[engineName] = resolvedRequests[engineIndex]
	}
	return results
}

/** Sort an array by how frequently items are repeated, and based on their weight */
function sortByFrequency<T>(items: WeightedValue<T>[]): T[] {
	const occurencesMap: Map<T, number> =  new Map()
	for (const item of items) {
		if (occurencesMap.has(item.value))
			occurencesMap.set(item.value, occurencesMap.get(item.value)! + item.weight)
		else
			occurencesMap.set(item.value, item.weight)
	}

	const occurencesMapSorted = new Map(
		[...occurencesMap.entries()]
		.sort(([a, numberA], [b, numberB]) => numberB - numberA)
	)

	return Array.from(occurencesMapSorted.keys())
}

interface WeightedValue<T> {
	weight: number
	value: T
}

export interface Options {
	results: EngineUrlResult[]
	answer: InstantAnswer | null
	sidebar: SidebarAnswer | null
	suggestion: string | null
	debug: boolean
	engines: EngineResponse[]
	plugins: any
}

interface EngineUrlResult {
	url: string,
	title: string,
	content: string,
	score: number,
	weight: number,
	engines: string[]
}

async function request(query: string, req: RequestOptions): Promise<Options> {
	const results: { [ key: string ]: EngineUrlResult } = {}
	const enginesResults = await requestAllEngines(query, req)
	let answer: InstantAnswer | null = null
	let sidebar: SidebarAnswer | null = null
	let suggestions: WeightedValue<string>[] = []

	for (const engineName in enginesResults) {
		const engine: Engine = engines[engineName]
		const engineWeight: number = engine.weight ?? 1
		const engineResponse: EngineResponse = enginesResults[engineName]

		const engineAnswer = engineResponse.answer
		const engineSidebarAnswer = engineResponse.sidebar
		const answerEngineWeight = answer?.engine?.weight ?? 1

		if (engineAnswer && ((engineWeight > answerEngineWeight) || !answer)) {
			answer = engineAnswer
			answer.engine = engine
		}
		if (engineSidebarAnswer !== undefined && (!sidebar || !sidebar.engine || (sidebar.engine.weight && engineWeight > sidebar.engine.weight))) {
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
			// for some reason the engine will be there twice, not sure why, for example first result for "mat does dev" has google twice
			if (!results[normalUrl].engines.includes(engineName))
				results[normalUrl].engines.push(engineName)
		}
	}
	const calculatedResults = Object.values(results).sort((a: EngineUrlResult, b: EngineUrlResult) => b.score - a.score).filter((result: EngineUrlResult) => result.url !== answer?.url)
	const suggestionsSorted = sortByFrequency(suggestions)
	const suggestion = suggestionsSorted.length >= 1 ? suggestionsSorted[0] : null

	// do some last second modifications, if necessary, and return the results!
	return await requestAllPlugins({
		results: calculatedResults,
		answer,
		sidebar,
		suggestion,

		debug: req.debug,
		engines: Object.values(enginesResults),

		plugins: {} // these will be modified by plugins()
	})
}

async function autocomplete(query) {
	const enginesResults = await requestAllAutoCompleteEngines(query)
	const weightedItems: WeightedValue<string>[] = []
	for (const engineName in enginesResults) {
		const engine = engines[engineName]
		for (let position = 0; position < enginesResults[engineName].length; position ++)
			weightedItems.push({
				value: enginesResults[engineName][position],
				weight: (engine.weight ?? 1) / (position + 1)
			})
	}
	return sortByFrequency(weightedItems).slice(0, 10)
}

// do some last second non-http modifications to the results
async function requestAllPlugins(options: Options) {
	for (const pluginName in plugins) {
		const plugin = plugins[pluginName]
		if (plugin.changeOptions) 
			options = await plugin.changeOptions(options)
	}
	return options
}

async function runPlugin({ pluginName, options }) {
	return await plugins[pluginName].runPlugin(options)
}

export { request, autocomplete, runPlugin }
