
  
const express = require("express");
const app = express();
const PORT = 8080; // default port is 8080

const cookieSession = require('cookie-session');

const bcrypt = require('bcryptjs');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({name: 'session', keys: ['hello'] }));

const { getUserByEmail, generateRandomString, urlsForUser } = require('./helper');

const urlDatabase = {};
const users = {};

app.set("view engine", "ejs");

// URL index page
app.get('/urls', (req, res) => {
  const userID = req.session.userID;
  const userUrls = urlsForUser(userID, urlDatabase );
  let templateVars = { urls: userUrls, user: users[userID] };
  res.render('urls_index', templateVars);
});

//Make a shortURL then database and redirects /urls/shortURL
app.post('/urls', (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session.userID
  };
  res.redirect(`/urls/${shortURL}`);
})

// new url creation page
app.get('/urls/new', (req, res) => {
  if (req.session.userID) {
    let templateVars = {user: users[req.session.userID]};
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

//short URL that shows both versions
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.userID;
  const userUrls = urlsForUser(userID, urlDatabase);
  console.log(userUrls);
  let templateVars = { urls: userUrls, user: users[userID], shortURL: req.params.shortURL };
  res.render("urls_show", templateVars);
});

// updates the longURL in the database
app.post('/urls/:shortURL', (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.userID  && req.session.userID === urlDatabase[shortURL].userID) {
    urlDatabase[shortURL].longURL = req.body.updatedURL;
    res.redirect(`/urls`);
  } else {
    const errorMessage = 'You are not authorized to do that.';
    res.status(401).render('urls_error', {user: users[req.session.userID], errorMessage});
  }
});


// deletes a url from database, redirects to index page
app.post('/urls/:shortURL/delete', (req, res) => {
  const shortURL = req.params.shortURL;
  if (req.session.userID === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
  }

  res.redirect('/urls');
});


app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  console.log(longURL);
  if (longURL) {
    res.redirect(longURL);
  } else {
    res.statusCode = 404;
    res.send('<h2>404 Not Found<br>This short URL does not exist Sorry!.</h2>')
  }
});

// The Login page
app.get('/login', (req, res) => {
  if (users[req.session.userID]) {
    res.redirect('/urls');
    return;
  }

  const templateVars = {user: users[req.session.userID]};
  res.render('urls_login', templateVars);
});

// Login 
app.post('/login', (req, res) => {
  const user = getUserByEmail(req.body.email, users);
  console.log("This is the", user);

  if (user && bcrypt.compareSync(req.body.password, user.password)) {
    req.session.userID = user.userID;
    res.redirect('/urls');
  } else {
    res.statusCode = 403;
    res.send('<h2>403 Forbidden<br>You entered the wrong password.</h2>');
  }
  res.statusCode = 403;
  res.send('<h2>403 Forbidden<br>This email address is not registered.</h2>');
}
);

// Logout 
app.post('/logout', (req, res) => {
  req.session = null
  res.clearCookie('session');
  res.clearCookie('session.sig');
  res.redirect('/urls');
})

// registration page
app.get('/register', (req, res) => {
  if (users[req.session.userID]) {
    res.redirect('/urls');
    console.log('Hello');
    return;
  }
  const templateVars = {user: users[req.session.userID]}
  console.log('registerget', users)
  res.render('urls_registration', templateVars);
});

// register functionality
app.post('/register', (req, res) => {
  if (req.body.email && req.body.password) {
    if (!getUserByEmail(req.body.email, users)) {
      const userID = generateRandomString();
      users[userID] = {
        userID,
        email: req.body.email,
        password: bcrypt.hashSync(req.body.password, 10)
      }
      req.session.userID = userID;
      console.log('reg.session.userID', users)
      return res.redirect('/urls');
    } else {
      res.statusCode = 400;
      res.send('<h2>400  Bad Request<br>Email already registered.</h2>')
    }
  } else {
    res.statusCode = 400;
    res.send('<h2>400  Bad Request<br>Please fill out the email and password fields.</h2>')
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});