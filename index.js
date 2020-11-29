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

app.get('/search', async function(req, res) {
    const query = req.query.q
    const results = await search.request(query)
    const options = {
        results: results.results,
        answer: results.answer,
        sidebar: results.sidebar,
        query
    }
    if (req.query.json === 'true') {
        res.json(options)
    } else {
        res.render('search.html', options)
    }
})

app.get('/opensearch.xml', async function(req, res) {
    res.header('Content-Type', 'text/xml');
    res.render('opensearch.xml', {
        host: req.hostname,
    })
})

app.get('/autocomplete', async function(req, res) {
    const query = req.query.q
    const results = await search.autocomplete(query)
    res.json(results)
})

app.use(express.static('public'))

app.listen(8000, () => console.log('pog'))

module.exports = require('require-dir')();
