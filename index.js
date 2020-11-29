const express = require('express')
const nunjucks = require('nunjucks')
const search = require('./search')

var app = express()

nunjucks.configure('views', {
    autoescape: true,
    express: app
})

app.get('/', function(req, res) {
    res.render('index.html')
})

app.get('/search', async function(req, res) {
    const query = req.query.q
    const results = await search.request(query)
    const options = {
        results: results.results,
        answer: results.answer,
        query
    }
    if (req.query.json === 'true') {
        res.json(options)
    } else {
        res.render('search.html', options)
    }
})

app.use(express.static('public'))

app.listen(8000, () => console.log('pog'))

module.exports = require('require-dir')();
