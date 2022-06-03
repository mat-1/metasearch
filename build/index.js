"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const nunjucks = __importStar(require("nunjucks"));
const search = __importStar(require("./search"));
const express_1 = __importDefault(require("express"));
const themes = require('../src/themes.json');
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)());
const env = nunjucks.configure('src/views', {
    autoescape: true,
    express: app
});
env.addGlobal('dark', false);
env.addGlobal('getHost', url => new URL(url).hostname);
env.addFilter('qs', (params) => {
    return (Object.keys(params)
        .map(key => `${key}=${params[key]}`)
        .join('&'));
});
function loadTheme(name) {
    let themeData = themes[name];
    if (!themeData)
        themeData = themes.dark;
    if (name !== 'light')
        themeData = Object.assign({}, loadTheme(themeData.base || 'light'), themeData);
    return themeData;
}
function render(res, template, options = {}) {
    const themeName = res.req.cookies.theme || 'dark';
    const font = res.req.cookies.font || 'default';
    const theme = loadTheme(themeName);
    options.theme = theme;
    options.font = font;
    return res.render(template, options);
}
app.get('/', function (req, res) {
    render(res, 'index.html');
});
app.get('/search', async function (req, res) {
    const query = req.query.q;
    try {
        const results = await search.request(query, {
            req,
            debug: req.cookies.debug === 'true',
            hostname: req.hostname,
            theme: req.cookies.theme || 'dark'
        });
        const options = {
            query,
            showIcons: req.cookies.showIcons === 'true',
            ...results
        };
        if (req.query.json === 'true') {
            res.json(options);
        }
        else {
            render(res, 'search.html', options);
        }
    }
    catch (err) {
        console.error(err);
        return res.status(500).send(err.message);
    }
});
app.get('/opensearch.xml', async function (req, res) {
    res.header('Content-Type', 'application/xml');
    render(res, 'opensearch.xml', {
        host: req.hostname
    });
});
app.get('/autocomplete', async function (req, res) {
    const query = req.query.q;
    const results = await search.autocomplete(query);
    res
        .header('Content-Type', 'application/json')
        .json([query, results]);
});
app.get('/plugins/:plugin', async function (req, res) {
    let pluginName = req.params.plugin;
    if (pluginName.endsWith('.js'))
        pluginName = pluginName.slice(0, pluginName.length - 3);
    const options = req.query;
    const data = await search.runPlugin({ pluginName, options });
    res.header('Content-Type', 'application/javascript');
    if (data === false)
        // if it's false then it shouldn't do anything
        res.send('');
    else
        render(res, `plugins/${pluginName}.njk`, data);
});
app.get('/settings', function (req, res) {
    const activeTheme = res.req.cookies.theme || 'brave dark';
    const activeFont = res.req.cookies.font || 'monaco';
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
    });
});
app.use('/', express_1.default.static('src/public'));
app.listen(8000, () => console.log('Running at http://localhost:8000'));
exports.default = require('require-dir')();
setInterval(() => {
    console.log(process.memoryUsage().heapUsed / 1024 / 1024 + 'mb');
}, 1000 * 60);
