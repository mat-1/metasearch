const express = require('express')
const nunjucks = require('nunjucks')

var app = express();

nunjucks.configure('views', {
    autoescape: true,
    express: app
});

app.get('/', function(req, res) {
    res.render('index.html');
});

app.listen(8000, () => console.log('pog'))