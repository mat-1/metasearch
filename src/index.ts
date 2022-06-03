import type { Request as ExpressRequest } from 'express'
import cookieParser from 'cookie-parser'
import * as nunjucks from 'nunjucks'
import * as search from './search'
import express from 'express'
import { Options } from './search'

const themes = require('../src/themes.json')

const app = express()
app.use(cookieParser())

const env = nunjucks.configure('src/views', {
	autoescape: true,
	express: app
})

env.addGlobal('dark', false)
env.addGlobal('getHost', url => new URL(url).hostname)
env.addFilter('qs', (params) => {
	return (
		Object.keys(params)
		.map(key => `${key}=${params[key]}`)
		.join('&')
	)
})

function loadTheme(name) {
	let themeData = themes[name]
	if (!themeData) themeData = themes.dark
	if (name !== 'light') 
		themeData = Object.assign({}, loadTheme(themeData.base || 'light'), themeData)
	return themeData
}

interface RenderOptions {
	host?: string

	themes?: Array<any>
	fonts?: string[]

	theme?: string
	font?: string

	activeTheme?: string
	activeFont?: string
	showIcons?: boolean
	debug?: boolean
}


function render(res, template, options = {} as RenderOptions & Partial<Options>) {
	const themeName = res.req.cookies.theme || 'dark'
	const font = res.req.cookies.font || 'default'
	const theme = loadTheme(themeName)
	options.theme = theme
	options.font = font
	return res.render(template, options)
}

app.get('/', function(req, res) {
	render(res, 'index.html')
})


app.get('/search', async function(req: ExpressRequest, res) {
	const query = req.query.q as string
	try {
		const results = await search.request(query, {
			req,
			debug: req.cookies.debug === 'true',
			hostname: req.hostname,
			theme: req.cookies.theme || 'dark'
		})
		const options = {
			query,
			showIcons: req.cookies.showIcons === 'true',
			...results
		}
		if (req.query.json === 'true') {
			res.json(options)
		} else {
			render(res, 'search.html', options)
		}

	} catch (err) {
		console.error(err)
		return res.status(500).send(err.message)
	}
})

app.get('/opensearch.xml', async function(req, res) {
	res.header('Content-Type', 'application/xml')
	render(res, 'opensearch.xml', {
		host: req.hostname
	})
})

app.get('/autocomplete', async function(req, res) {
	const query = req.query.q
	const results = await search.autocomplete(query)
	res
		.header('Content-Type', 'application/json')
		.json([ query, results ])
})

app.get('/plugins/:plugin', async function(req, res) {
	let pluginName = req.params.plugin
	if (pluginName.endsWith('.js')) pluginName = pluginName.slice(0, pluginName.length - 3)
	const options = req.query
	const data = await search.runPlugin({ pluginName, options })
	res.header('Content-Type', 'application/javascript')
	if (data === false)
		// if it's false then it shouldn't do anything
		res.send('')
	else
		render(res, `plugins/${pluginName}.njk`, data)
})

app.get('/settings', function(req, res) {
	const activeTheme = res.req.cookies.theme || 'brave dark'
	const activeFont = res.req.cookies.font || 'monaco'
	render(res, 'settings.html', {
		themes,
		fonts: [
			'default',
			'Arial',
			'Monaco',
			'Poppins'
		],
		activeTheme,
		activeFont,
		debug: req.cookies.debug === 'true',
		showIcons: req.cookies.showIcons === 'true',
	})
})

app.use('/', express.static('src/public'))

app.listen(8000, () => console.log('Running at http://localhost:8000'))

export default require('require-dir')()

setInterval(() => {
	console.log(process.memoryUsage().heapUsed / 1024 / 1024 + 'mb')
}, 1000 * 60)