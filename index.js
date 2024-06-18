const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const validUrl = require('valid-url');

class URLShortener {
    constructor() {
        this.urlMapping = {};
        this.baseUrl = 'https://rohitjoshi';
        this.shortLen = 6;
        this.char = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    }

    generateShortCode() {
        let shortCode = '';
        for (let i = 0; i < this.shortLen; i++) {
            const randomIndex = Math.floor(Math.random() * this.char.length);
            shortCode += this.char[randomIndex];
        }
        return shortCode;
    }

    encodeURL(longURL) {
        let shortCode;
        do {
            shortCode = this.generateShortCode();
        } while (this.urlMapping.hasOwnProperty(shortCode));

        const shortURL = this.baseUrl + shortCode;
        this.urlMapping[shortCode] = longURL;
        return shortURL;
    }

    decodeURL(shortCode) {
        return this.urlMapping[shortCode];
    }
}

const app = express();
const urlShortener = new URLShortener();

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname)));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.post('/encode', (req, res) => {
    const longURL = req.body.longURL;
    if (validUrl.isUri(longURL)) {
        const shortURL = urlShortener.encodeURL(longURL);
        res.json({ shortURL });
    } else {
        res.status(400).json({ error: 'Invalid URL' });
    }
});
//decode
app.post('/decode', (req, res) => {
    const shortURL = req.body.shortURL;
    const baseUrlPattern = new RegExp(`^${urlShortener.baseUrl}`);
    if (validUrl.isUri(shortURL) && baseUrlPattern.test(shortURL)) {
        const shortCode = shortURL.replace(urlShortener.baseUrl, '');
        const longURL = urlShortener.decodeURL(shortCode);
        if (longURL) {
            res.json({ longURL });
        } else {
            res.status(404).json({ error: 'Short URL not found' });
        }
    } else {
        res.status(400).json({ error: 'Invalid short URL' });
    }
});

app.get('/:shortCode', (req, res) => {
    const shortCode = req.params.shortCode;
    const longURL = urlShortener.decodeURL(shortCode);
    if (longURL) {
        res.redirect(longURL);
    } else {
        res.status(404).send('Short URL not found');
    }
});

module.exports = app;

