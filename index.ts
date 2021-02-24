const themes = require('./src/themes.json')
import * as cookieParser from 'cookie-parser'
import * as nunjucks from 'nunjucks'
import * as express from 'express'
import * as search from './src/search'

const app = express()
app.use(cookieParser())

const env = nunjucks.configure('src/views', {
	autoescape: true,
	express: app
})

env.addGlobal('dark', false)
env.addFilter('qs', (params) => {
	return (
		Object.keys(params)
		.map(key => `${key}=${params[key]}`)
		.join('&')
	)
})

function loadTheme(name) {
	let themeData = themes[name]
	if (name !== 'light') { themeData = Object.assign({}, loadTheme(themeData.base || 'light'), themeData) }
	return themeData
}

interface RenderOptions {
	host?: string
	themes?: Array<any>
	activeTheme?: string
	theme?: string
}
  
function render(res, template, options = {} as RenderOptions) {
	const themeName = res.req.cookies.theme || 'light'
	const theme = loadTheme(themeName)
	options.theme = theme
	return res.render(template, options)
}

app.get('/', function(req, res) {
	render(res, 'index.html')
})

app.get('/search', async function(req, res) {
	const query = req.query.q
	const results = await search.request(query)
	const options = {
		query,
		...results
	}
	if (req.query.json === 'true') {
		res.json(options)
	} else {
		render(res, 'search.html', options)
	}
})

app.get('/opensearch.xml', async function(req, res) {
	res.header('Content-Type', 'text/html')
	res.header('Content-Disposition', 'attachment; filename="opensearch.xml"')
	// res.header('Content-Type', 'application/opensearchdescription+xml')
	render(res, 'opensearch.xml', {
		host: req.hostname
	})
})

app.get('/autocomplete', async function(req, res) {
	const query = req.query.q
	const results = await search.autocomplete(query)
	res.json([query, results, null, null])
})

app.get('/plugins/:plugin.js', async function(req, res) {
	const pluginName = req.params.plugin
	const options = req.query
	const data = await search.runPlugin({ pluginName, options })
	res.header('Content-Type', 'application/javascript')
	if (data === false)
		// if it's false then it shouldn't do anything
		res.send('')
	else
		render(res, `plugins/${pluginName}.js`, data)
})

app.get('/settings', function(req, res) {
	const activeTheme = res.req.cookies.theme || 'light'
	render(res, 'settings.html', { themes, activeTheme })
})

app.use('/', express.static('src/public'))

app.listen(8000, () => console.log('pog'))

export default require('require-dir')()
