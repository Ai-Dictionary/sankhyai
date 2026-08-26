const express = require('express');
const http = require('http');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const querystring = require('querystring');
const ejs = require('ejs');
const jsonfile = require('jsonfile');
const rateLimit = require('express-rate-limit');
const { ipKeyGenerator } = require('express-rate-limit');
const helmet = require('helmet');
const xss = require('xss-clean');
const crypto = require('crypto');
const cookieParser = require('cookie-parser');
const os = require('os');
let varchar, security, hex, Memory;
try{
    varchar = require('./config/env-variables');
    security = require('./config/security');
    hex = require('./config/hex');
    Memory = require('./config/memory');
}catch{
    varchar = require('./config/env-variables.ts');
    security = require('./config/security.ts');
    hex = require('./config/hex.ts');
    Memory = require('./config/memory.ts');
}

require('./public/App.test.js');
require('dotenv').config();

const app = express();
let server = http.createServer(app);
const PORT = process.env.PORT || 6300;
const AppName = "sankhyai";

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

if(hex.isLocalhost(os)){
    app.use('/assets', express.static(path.join(__dirname, 'assets')));
}
app.use('/config', express.static(path.join(__dirname,'config')));
app.use('/static', express.static(path.join(__dirname, 'public')));
app.use('/public', (req, res, next) => {
    req.url = req.url.replace(/^\/public/, '');
    const staticMiddleware = express.static(path.join(__dirname, 'public'));
    staticMiddleware(req, res, next);
});

app.use(bodyParser.json({ limit: '1mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

const limiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 100,
    keyGenerator: (req) => ipKeyGenerator({ ip: req.headers['x-forwarded-for'] || req.ip }),
    skipSuccessfulRequests: true,
    message: 'Too many requests hit the server, please try again later or check our fair use policy',
});

app.use((req, res, next) => {
    res.locals.nonce = crypto.randomBytes(16).toString('base64');
    res.locals.isAppRequest = (req.headers['x-from-app'] === 'm2t2' || req.query.token == '24fc8akm8o4s');
    next();
});

app.use((req, res, next) => {
    const allowedOrigins = [
        "http://127.0.0.1:5000",
        "http://127.0.0.1:6300",
    ];
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.setHeader("Access-Control-Allow-Origin", origin);
        res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
        res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
        res.setHeader("Access-Control-Allow-Credentials", "true");
    }
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});

app.use((req, res, next) => {
    const frameSources = ["'self'", "https://vercel.live", "file:", "app:", "blob:"];
    if (res.locals.isAppRequest) {
        console.log("Request from APP");
        frameSources.push("*");
    }
    helmet.contentSecurityPolicy({
        useDefaults: true,
        directives: {
            "default-src": ["'self'"],
            "script-src": [
                "'self'",
                "'unsafe-hashes'",
                "https://cdnjs.cloudflare.com",
                "https://vercel.live",
                "https://vercel.com",
                "https://ai-dictionary.github.io",
                "https://code.jquery.com",
                "https://cdn.jsdelivr.net",
                (req, res) => `'nonce-${res.locals.nonce}'`
            ],
            "script-src-attr": ["'unsafe-inline'"],
            "style-src": [
                "'self'",
                "https://fonts.googleapis.com",
                "https://maxcdn.bootstrapcdn.com",
                "https://stackpath.bootstrapcdn.com",
                "https://ai-dictionary.github.io",
                "https://getbootstrap.com",
                "'unsafe-inline'" 
            ],
            "font-src": [
                "'self'",
                "https://maxcdn.bootstrapcdn.com",
                "https://stackpath.bootstrapcdn.com",
                "https://fonts.gstatic.com",
                "data:"
            ],
            "img-src": ["'self'", "data:", "https://avatars.githubusercontent.com", "https://ai-dictionary.github.io", "https://vercel.com", "https://raw.githubusercontent.com", "https://kidkrishkode.github.io", "https://mockmantra.in"],
            "connect-src": [
                "'self'",
                "https://maxcdn.bootstrapcdn.com",
                "wss://ws-us3.pusher.com",
                "https://ws-us3.pusher.com",
                "https://chsapi.vercel.app",
                "http://127.0.0.1:6100",
            ],
            "frame-ancestors": frameSources
        },
    })(req, res, next);
});

app.use([
    xss(),
    limiter,
    express.json(),
    express.urlencoded({ extended: true }),
    (req, res, next) => {
        const BLOCK_DURATION_MS = 60 * 1000;
        const clientIP = req.headers['x-forwarded-for'] || req.headers['x-vercel-forwarded-for'] || req.connection.remoteAddress || req.ip;
        const userAgent = req.headers['user-agent'];
        const cookieBlock = hex.isClientBlockedByCookie(req);
        
        if(req.url == '/'+varchar.revive) next();

        if(varchar.blockedIPs.includes(clientIP) || cookieBlock === 'blocked' || (!userAgent || userAgent.includes('bot') || userAgent.length < 10)){
            console.warn(`Blocked IP attempt to attack: ${clientIP}`);
            return req.destroy() || res.connection.destroy();
        }
        if(varchar.tempBlockedIPs.has(clientIP) || cookieBlock === 'temp'){
            const blockedAt = varchar.tempBlockedIPs.get(clientIP);
            const now = Date.now();
            if(now - blockedAt < BLOCK_DURATION_MS || cookieBlock === 'temp'){
                return res.status(403).send('Your IP is temporarily blocked due to excessive requests. Try again 1 min later either your account will be permanent blocked.');
            }else{
                varchar.tempBlockedIPs.delete(clientIP);
                varchar.ipHits[clientIP] = 0;
                hex.setBlockCookie(res, 'normal');
                // next();
            }
        }
        if(Object.keys(varchar.ipHits).length >= 10000 && !varchar.ipHits[clientIP]){
            console.warn(`Max users limit reached. Dropping new user with IP: ${clientIP}`);
            return res.status(429).send('Server is too busy now, Because to many user is present in the lobby. Please try again some time later or report us');
        }
        varchar.ipHits[clientIP] = (varchar.ipHits[clientIP] || 0) + 1;
        if((varchar.ipHits[clientIP] > 100 && varchar.ipHits[clientIP] < 200) && (clientIP != "::1")){
            varchar.tempBlockedIPs.set(clientIP, Date.now());
            delete varchar.ipHits[clientIP];
            hex.setBlockCookie(res, 'temp');
            return res.status(403).send('Your IP has been temporarily blocked due to exceed the request limit. Please check our fair use policy.');
        }
        if((varchar.ipHits[clientIP] >= 200) && (clientIP != "::1")){
            varchar.blockedIPs.push(clientIP);
            varchar.tempBlockedIPs.delete(clientIP);
            delete varchar.ipHits[clientIP];
            hex.setBlockCookie(res, 'blocked');
            return res.status(403).send('Access denied, client ip is permanent blocked due to past history of mal-practices! , don\'t try again other wise you even not hit our site also, So wait for a day.');
        }
        next();
    }
]);

app.use(async (req, res, next) => {
    try{
        const url = req.originalUrl;
        const query = url.split('?')[1];
        const baseURL = req.protocol + '://' + req.get('host');
        const params = new URL(url, baseURL).searchParams;
        const public_key = String(varchar.public_key);
        if(params.has('encode')){
            if(query!=undefined){
                const decodedUrl = security.substitutionDecoder(query.replace('encode=',''), public_key);
                req.url = `${url.split('?')[0]}?${decodedUrl}`;
                req.query = querystring.parse(decodedUrl);
            }
        }else{
            if(query!=undefined){
                const encodedUrl = security.substitutionEncoder(query, public_key);
                req.url = `${url}?encode=${encodedUrl}`;
                req.query = querystring.parse(encodedUrl);
            }
        }
        next();
    }catch(e){
        res.status(401).render('notfound',{error: 401, message: "Unauthorize entry not allow, check the source or report it", statement: e});
    }
});



app.get('/', async (req, res) => {
    const nonce = res.locals.nonce;
    const isHosted = hex.isHosted(req);
    const token = req.cookies.auth_token;
    
    res.status(200).sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/js/main.js', (req, res) => {
    res.status(300).sendFile(path.join(__dirname, 'public', 'default.min.js'));
});

app.get('/varchar', (req, res) => {
    res.status(200).json(varchar);
});

app.post('/reg', (req, res) => {
    const clientIP = req.headers['x-forwarded-for'] || req.headers['x-vercel-forwarded-for'] || req.connection.remoteAddress || req.ip;
    console.log("/reg route hitted by ", clientIP);
    res.status(500).json({"status": 500, message: "Registration system is not connected yet, wait for next day"});
});

app.all(/.*/, (req, res) => {
    res.status(404).render('notfound',{nonce: res.locals.nonce, error: 404, message: "Page not found on this url, check the source or report it"});
});

server.listen(PORT, (err) => {
    if(err) console.log("Oops an error occure:  "+err);
    console.log(`Compiled successfully!\n\nYou can now view \x1b[33m./${path.basename(__filename)}\x1b[0m in the browser.`);
    console.info(`\thttp://localhost:${PORT}`);
    console.log("\n\x1b[32mNode web compiled!\x1b[0m \n");
});
