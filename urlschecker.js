function urlsForUser(id) {
 const output = [];
 for (shorturl in urlDatabase) {
  if (urlDatabase[shorturl].userID === id) {
    output.push(shorturl);
  }
 }
 return output;
}

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

console.log(urlsForUser('4f2343'));