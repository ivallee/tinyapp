// server.js
// load the things we need
const express = require('express');
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.set('view engine', 'ejs');

const PORT = 8080;

// database
const urlDatabase = {
  "92xVn2": {
    URL: "http://www.lighthouselabs.ca",
    userID: '4f2343'
  },
  "9sm5xK": {
    URL: "http://www.google.com",
    userID: '234234d'
  }
};

// users database
const users = {
  "4f2343" : {
    id: '4f2343',
    email: 'user1@example.com',
    password: 'cows'
  },
  "234234d" : {
    id: '234234d',
    email: 'user2@example.com',
    password: 'pigs'
  }
}

app.use((req, res, next) => {
  const userid = req.cookies.user_id;
  if (userid && userid in users) {
    res.locals.username = users[userid].email;
  } else {
    res.locals.username = undefined;
  }
  res.locals.urls = urlDatabase;
  res.locals.users = users;
  next();
})

function generateRandomString() {
  const randomStr = Math.floor((1 + Math.random()) * 0x100000).toString(16);
  return 'u' + randomStr;
}

function urlsForUser(id) {
 const output = [];
 for (shorturl in urlDatabase) {
  if (urlDatabase[shorturl].userID === id) {
    output.push(shorturl);
  }
 }
 return output;
}
/////////////////////////////////////////////////////THIS IS WHERE YOU
// index page
app.get('/', (req, res) => {
  res.redirect('/urls');
});

// Registration page
app.get('/register', (req, res) => {
  req.cookies['user_id'];
  res.render('urls_register');
});

// URL index page
app.get('/urls', (req, res) => {
  if (!req.cookies['user_id']) {
  console.log('No dice bro');
  return res.send('For registered users only. Please register or Log in');
  }
  req.cookies['user_id'];
  res.render('urls_index');
});

// Login page
app.get('/login', (req, res) => {
  req.cookies['user_id'];
  res.render('urls_login');
});

// Shorten url page
app.get("/urls/new", (req, res) => {
  req.cookies['user_id'];
  if (!req.cookies['user_id']) {
    console.log('No dice bro');
    return res.redirect('/login');
  }
  res.render("urls_new");
});

// renders page for shortened URL
app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.redirect('/urls/new');
  }
  const templateVars = {
    longURL: urlDatabase[req.params.id].URL,
    shortURL: req.params.id,
  }
  req.cookies['user_id'];
  res.render("urls_show", templateVars);
});

// redirect shortURL to longURL
app.get("/u/:shortURL", (req, res) => {
  console.log(urlDatabase[req.params.shortURL]);
  const longURL = urlDatabase[req.params.shortURL]['URL'];
  res.redirect(302, longURL);
  console.log(`Redirected to ${longURL}`);
});

// Handles registration
app.post('/register', (req, res) => {
  const randomid = generateRandomString();
  if (req.body.email === '' || req.body.password === '') {
    console.log('No email or no password');
    return res.sendStatus(400);
  }
  for (key in users) {
    if (users[key].email === req.body.email) {
      console.log('user already exists');
      return res.sendStatus(400);
    }
  }
  users[randomid] = {
    id: randomid,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie('user_id', randomid);
  res.redirect('/urls');
});


// Respond to new URL submission
app.post("/urls", (req, res) => {
  const randomid = (generateRandomString());
  urlDatabase[randomid] = { URL: req.body.longURL, userID: '' }
  res.redirect(302, `/urls/${randomid}`);
  console.log(`redirected to /urls/${randomid}`);
  });

// Respond to login and set cookie
app.post("/login", (req, res) => {
  for (key in users) {
    if (users[key].email == req.body.email) {
      if (users[key].password === req.body.password) {
        console.log('login successful!');
        res.cookie('user_id', users[key].id);
        return res.redirect('/urls');
      }
    }
  }
    res.sendStatus(403);
});

// Respond to logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  console.log('Cleared cookie');
  res.redirect(302, '/urls');
})

// Delete URLs
app.post("/urls/:id/delete", (req, res) => {
  if (!req.cookies['user_id']) {
    console.log('No dice bro');
    return res.redirect('/login');
  }
  delete urlDatabase[req.params.id];
  console.log('URL deleted');
  res.redirect(302, "/urls");
})

// Edit a URL
app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL;
  console.log('URL updated');
  res.redirect(302, "/urls");
})

app.listen(PORT);
console.log(`Server listening on port ${PORT}`);