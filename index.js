const express = require('express')
const nunjucks = require('nunjucks')
const search = require('./search')

var app = express()


const env = nunjucks.configure('views', {
    autoescape: true,
    express: app
})

app.get('/', function(req, res) {
    res.render('index.html')
})

env.addGlobal('dark', false)
env.addFilter('qs', (params) => {
    return (
        Object.keys(params)
        .map(key => `${key}=${params[key]}`)
        .join('&')
    )
})

app.get('/search', async function(req, res) {
    const query = req.query.q
    const results = await search.request(query)
    let options = {
        query,
        ...results
    }
    if (req.query.json === 'true') {
        res.json(options)
    } else {
        res.render('search.html', options)
    }
})

app.get('/opensearch.xml', async function(req, res) {
    res.header('Content-Type', 'application/opensearchdescription+xml');
    res.render('opensearch.xml', {
        host: req.hostname,
    })
})

app.get('/autocomplete', async function(req, res) {
    const query = req.query.q
    const results = await search.autocomplete(query)
    res.json([query, results])
})

app.get('/plugins/:plugin.js', async function(req, res) {
    const pluginName = req.params.plugin
    const options = req.query
    let data = await search.runPlugin({ pluginName, options })
    res.header('Content-Type', 'application/javascript');
    if (data === false)
        // if it's false then it shouldn't do anything
        res.send('')
    else
        res.render(`plugins/${pluginName}.js`, data)
})



app.use(express.static('public'))

app.listen(8000, () => console.log('pog'))

module.exports = require('require-dir')();
