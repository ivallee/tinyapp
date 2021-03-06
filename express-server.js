const express = require('express');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 8080;

// URL database
const urlDatabase = {
  "92xVn2": {
    id: "92xVn2",
    URL: "http://www.lighthouselabs.ca",
    userID: '4f2343'
  },
  "9sm5xK": {
    id: "9sm5xK",
    URL: "http://www.google.com",
    userID: '234234d'
  }
};

// Users database
const users = {
  "4f2343": {
    id: '4f2343',
    email: 'user1@example.com',
    password: bcrypt.hashSync('cows', 10)
  },
  "234234d": {
    id: '234234d',
    email: 'user2@example.com',
    password: bcrypt.hashSync('pigs', 10)
  }
};

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: 'session',
  keys: ['key']
}));

app.use((req, res, next) => {
  const userid = req.session.user_id;
  res.locals.isLoggedIn = false;
  if (userid && userid in users) {
    res.locals.username = users[userid].email;
    res.locals.isLoggedIn = true;
  }
  res.locals.urls = urlDatabase;
  res.locals.users = users;
  next();
});

function generateRandomString() {
  return randomStr = Math.floor((1 + Math.random()) * 0x100000).toString(16);
}

function urlsForUser(id) {
  const output = [];
  for (shorturl in urlDatabase) {
    if (urlDatabase[shorturl].userID === id) {
      output.push(urlDatabase[shorturl]);
    }
  }
  return output;
}

// Index page
app.get('/', (req, res) => {
  if (!res.locals.isLoggedIn) {
    return res.redirect('/login');
  }
  res.redirect("/urls");
});

// Registration page
app.get('/register', (req, res) => {
  if (res.locals.isLoggedIn) {
    return res.redirect('/urls');
  }
  res.render('urls_register');
});

// URL index page
app.get('/urls', (req, res) => {
  if (!res.locals.isLoggedIn) {
    return res.status(401).send('Please <a href="/login">log in</a> or <a href="/register">register</a> to view this page');
  }
  res.render('urls_index', {
    myurls: urlsForUser(req.session['user_id'])
  });
});

// Login page
app.get('/login', (req, res) => {
  if (res.locals.isLoggedIn) {
    return res.redirect('/urls');
  }
  res.render('urls_login');
});

// Shorten url page
app.get("/urls/new", (req, res) => {
  if (!res.locals.isLoggedIn) {
    return res.redirect('/login');
  }
  res.render("urls_new");
});

// Renders page for shortened URL
app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send('Not Found');
  } else {
    if (!res.locals.isLoggedIn) {
      return res.status(401).send('Please <a href="/login">log in</a> or <a href="/register">register</a> to use this app');
    } else if (req.session['user_id'] !== urlDatabase[req.params.id].userID) {
      return res.status(401).send('This short URL does not belong to you');
    } else {
      const templateVars = {
        longURL: urlDatabase[req.params.id].URL,
        shortURL: req.params.id
      };
      res.render("urls_show", templateVars);
    }
  }
});

// Redirect shortURL to longURL
app.get("/u/:shortURL", (req, res) => {
  if (req.params.shortURL in urlDatabase) {
    const longURL = urlDatabase[req.params.shortURL]['URL'];
    return res.redirect(302, longURL);
  } else {
    res.status(404).send('Not Found');
  }
});

// Handles registration
app.post('/register', (req, res) => {
  if (!req.body.email || !req.body.password) {
    return res.status(400).send('Please enter a valid email and password');
  } else {
    for (const key in users) {
      if (users[key].email === req.body.email) {
        return res.status(400).send('User already exists');
      }
    }
    const randomid = generateRandomString();
    users[randomid] = {
      id: randomid,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    req.session.user_id = randomid;
    res.redirect('/urls');
  }
});


// Respond to new URL submission
app.post("/urls", (req, res) => {
  if (res.locals.isLoggedIn) {
    const randomid = generateRandomString();
    urlDatabase[randomid] = { id: randomid, URL: req.body.longURL, userID: req.session['user_id'] };
    return res.redirect(302, `/urls/${randomid}`);
  } else {
    res.status(401, 'Please log in or register to submit a URL');
  }
});

// Respond to login and set cookie
app.post("/login", (req, res) => {
  for (const key in users) {
    if (users[key].email === req.body.email && bcrypt.compareSync(req.body.password, users[key].password)) {
      req.session.user_id = users[key].id;
      return res.redirect('/urls');
    }
  }
  res.status(401).send('Please enter a valid email and password');
});

// Respond to logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect(302, '/urls');
});

// Edit URLs
app.post("/urls/:id", (req, res) => {
  if (req.session['user_id'] === urlDatabase[req.params.id].userID) {
    urlDatabase[req.params.id].URL = req.body.longURL;
    return res.redirect(302, "/urls");
  } else {
    res.status(401).send('Not authorized');
  }
});

// Delete URLs
app.post("/urls/:id/delete", (req, res) => {
  if (req.session['user_id'] === urlDatabase[req.params.id].userID) {
    urlDatabase[req.params.id].URL = req.body.longURL;
    delete urlDatabase[req.params.id];
    return res.redirect(302, "/urls");
  } else {
    res.status(401).send('Not authorized');
  }
});


app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});