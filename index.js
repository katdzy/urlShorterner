require('dotenv').config();
const express = require('express');
const cors = require('cors');
const dns = require('dns');
const app = express();

const port = process.env.PORT || 3003;

app.use(cors());
app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function (req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.get('/api/hello', function (req, res) {
  res.json({ greeting: 'hello API' });
});

app.use(express.urlencoded({
  limit: '10mb',
  extended: true
}));

const originalURLs = [];

app.post('/api/shorturl', (req, res) => {
  let originalUrl = req.body.url;

  let parsedUrl;
  try {
    parsedUrl = new URL(originalUrl);
  } catch (err) {
    return res.json({ error: 'invalid url' });
  }

  dns.lookup(parsedUrl.hostname, (err) => {
    if (err) {
      return res.json({ error: 'invalid url' });
    }

    const foundIndex = originalURLs.indexOf(originalUrl);

    if (foundIndex < 0) {
      originalURLs.push(originalUrl);
      const shortId = originalURLs.length;
      return res.json({
        original_url: originalUrl,
        short_url: shortId
      });
    }

    return res.json({
      original_url: originalUrl,
      short_url: foundIndex + 1
    });
  });
});

app.get("/api/shorturl/:value", (req, res) => {
  const shortenedURL = Number(req.params.value);
  if (Number.isNaN(shortenedURL)) {
    return res.json({ error: "Wrong format" });
  }

  if (shortenedURL < 1 || shortenedURL > originalURLs.length) {
    return res.json({ error: "No short URL found for the given input" });
  }

  res.redirect(originalURLs[shortenedURL - 1]);
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
