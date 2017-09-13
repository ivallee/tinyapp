// server.js
// load the things we need
const express = require('express');
const app = express();
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const PORT = 8080;

// database
const urlDatabase = {
  "92xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// set the view engine to ejs
app.set('view engine', 'ejs');

// use res.render to load up an ejs view file

// index page
app.get('/', (req, res) => {
  res.end('hello!');
});

// urls page
app.get('/urls', (req, res) => {
    let templateVars = { urls: urlDatabase };
    res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// renders page for shortened URL
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                        longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

// redirect shortURL to longURL
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(301, longURL);
  console.log(`Redirected to ${longURL}`);
});

// Respond to form submission
app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  const randomStr = (generateRandomString());
  urlDatabase[randomStr] = req.body.longURL;
  res.redirect(301, `/urls/${randomStr}`);
  console.log(`redirected to /urls/${randomStr}`);
  });

// Update a URL
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect(301, "/urls");
})

// Delete URLs
app.post("/urls/:id/delete", (req, res) => {
  console.log(req.params.id);
  delete urlDatabase[req.params.id];
  res.redirect(303, "/urls");
})

app.listen(PORT);
console.log(`Server listening on port ${PORT}`);

function generateRandomString() {
  const randomStr = Math.floor((1 + Math.random()) * 0x100000).toString(16);
  return randomStr;
}