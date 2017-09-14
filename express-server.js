// server.js
// load the things we need
const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const PORT = 8080;

// database
const urlDatabase = {
  "92xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// set the view engine to ejs
app.set('view engine', 'ejs');

// index page
app.get('/', (req, res) => {
  let templateVars = {
      urls: urlDatabase,
      username: req.cookies['username'],
    };
  res.end('hello!');
});

// urls page
app.get('/urls', (req, res) => {
    let templateVars = {
      urls: urlDatabase,
      username: req.cookies['username'],
    };
    res.render('urls_index', templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// renders page for shortened URL
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies['username']
  };
  res.render("urls_show", templateVars);
});

// redirect shortURL to longURL
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(302, longURL);
  console.log(`Redirected to ${longURL}`);
});

// Respond to form submission
app.post("/urls", (req, res) => {
  console.log(req.body);  // debug statement to see POST parameters
  const randomStr = (generateRandomString());
  urlDatabase[randomStr] = req.body.longURL;
  res.redirect(302, `/urls/${randomStr}`);
  console.log(`redirected to /urls/${randomStr}`);
  });

// Respond to login and set cookie
app.post("/login", (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);
  console.log('Set cookie!');
  res.redirect(302, "/urls");
})

// Delete URLs
app.post("/urls/:id/delete", (req, res) => {
  delete urlDatabase[req.params.id];
  console.log('URL deleted');
  res.redirect(302, "/urls");
})

// Update a URL
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  console.log('URL updated');
  res.redirect(302, "/urls");
})


app.listen(PORT);
console.log(`Server listening on port ${PORT}`);

function generateRandomString() {
  const randomStr = Math.floor((1 + Math.random()) * 0x100000).toString(16);
  return randomStr;
}