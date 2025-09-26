require('dotenv').config();
const express = require('express');
const cors = require('cors');
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
  const url = req.body.url;

  // Improved URL validation regex
  const urlPattern = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/;
  
  if (!urlPattern.test(url)) {
    return res.json({ error: 'invalid url' });
  }

  const foundIndex = originalURLs.indexOf(url);

  if (foundIndex < 0) {
    originalURLs.push(url);
    const shortId = originalURLs.length; 
    return res.json({
      original_url: url,
      short_url: shortId
    });
  }

  return res.json({
    original_url: url,
    short_url: foundIndex + 1
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