// server.js
// load the things we need
const express = require('express');
const app = express();

// database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
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

// single url in shortened form
app.get("/urls/:id", (req, res) => {
  let templateVars = { shortURL: req.params.id,
                        fullURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.listen(8080);
console.log('8080 is the magic port');