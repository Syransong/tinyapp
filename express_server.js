// Dependencies
const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const cookieSession = require("cookie-session");

// Helper Functions
const { generateRandomString, getUserByEmail,  getUserObjByEmail, urlsForUser, doesShortURLExist } = require("./helpers");

// Middleware
app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieSession({
  name: "cookieSession",
  keys: ["The future", "is bleak"]
}));

// Server Related
app.set("view engine", "ejs");

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


//Global Objects
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "kirby"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "coolGuy88"
  }
};

const users = {
  "coolGuy88": {
    id: "coolGuy88",
    email: "coolerthancool@cool.com",
    password: "$2b$10$4X43WoUqK5PGAEJwfEf6QOugrus/uklO2ET6/09MzokWDIUE8ISh2" // plain-text: cool
  },
  "kirby": {
    id: "kirby",
    email: "kirbykurbs@dreamland.com",
    password: "$2b$10$3NK2T99C0zJFHVuDrLtgeO.5fyVWjkb1HGvhSHRBbZ9hJ/UvYVgDK" // plain-text: kirby
  },
  "m72z90": {
    id: "m72z90",
    email: "b@b.com",
    password: "$2b$10$nc63emRo/f/3HZ/ArNBe5.b2OkodIsgoLhxhgbka8I.on78/lxC12" //plain-text: 12345
  }
};


// Routes

app.get("/", (req, res) => {
  const userID = req.session.user_id;

  if (!userID) {
    res.redirect("/login");

  } else {
    res.redirect("/urls");
  }
});

// URLs Page
app.get("/urls", (req, res) => {
  const userID = req.session.user_id;
  const urlsOfUser = urlsForUser(userID, urlDatabase);

  const templateVars = {
    urls: urlsOfUser,
    user: users[userID]
  };

  res.render("urls_index", templateVars);
});

// Displays new short URL creation form
app.get("/urls/new", (req, res) => {
  const userID = req.session.user_id;

  if (!userID) {
    res.redirect("/login");

  } else {
    const templateVars = {
      user: users[userID]
    };
    res.render("urls_new", templateVars);
  }
});

// Displays page of specific ShortURL
app.get("/urls/:shortURL", (req, res) => {
  const enteredShortURL = req.params.shortURL;
  const loggedUser = req.session.user_id;

  if (!doesShortURLExist(enteredShortURL, urlDatabase)) {
    res.status(400).send("Sorry, that URL does not exist. Please try again");
  }

  if (urlDatabase[enteredShortURL].userID === loggedUser) {
    let templateVars = {
      shortURL: enteredShortURL,
      longURL: urlDatabase[enteredShortURL].longURL,
      user: users[loggedUser]
    };
    res.render("urls_show", templateVars);
  
  } else {
    let templateVars = {
      user: false
    };

    res.render("urls_show", templateVars);
  }
});

// Redirects from short to long URL
app.get("/u/:shortURL", (req, res) => {
  const enteredShortURL = req.params.shortURL;

  if (!doesShortURLExist(enteredShortURL, urlDatabase)) {
    res.status(400).send("Sorry, that URL does not exist. Please try again");

  } else {
    const longURL = urlDatabase[enteredShortURL].longURL;
    res.redirect(longURL);
  }
});

// Creating new short URL
app.post("/urls", (req, res) => {
  res.statusCode = 200;
  let shortURL = generateRandomString();
  const userID = req.session.user_id;

  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: userID
  };
  res.redirect(`/urls/${shortURL}`);
});

// Deletes short URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session.user_id;
  const urlsOfUser = urlsForUser(userID, urlDatabase);

  if (Object.keys(urlsOfUser).includes(shortURL)) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
});

// Updates the shortURL
app.post("/urls/:shortURL/update", (req, res) => {
  const loggedUser = req.session.user_id;
  const shortURL = req.params.shortURL;
  const storedShortURL = urlDatabase[shortURL];
  const newLongURL = req.body.longURL;

  if (!loggedUser) {
    res.status(400).send("Sorry, you do not have the permissions to edit this URL.");

  } else {
    storedShortURL.longURL = newLongURL;
    res.redirect("/urls");
  }
});

// User Login Page
app.get("/login", (req, res) => {
  const templateVars = { user: null };

  if (req.session.user_id) {
    res.redirect("/urls");
  }

  res.render("login", templateVars);
});

// User Login Request
app.post("/login", (req, res) => {
  const submittedEmail = req.body.email;
  
  if (!getUserObjByEmail(submittedEmail, users)) {
    res.status(403).send("Sorry, that email does not have an associated account on TinyApp. Please try again.");
    
  } else if (getUserObjByEmail(submittedEmail, users)) {
    const submittedPW = req.body.password;
    const storedPW = getUserObjByEmail(submittedEmail, users).password;

    if (!(bcrypt.compareSync(submittedPW, storedPW))) {
      res.status(403).send("Sorry, the password inputted is incorrect. Please try again.");
   
    } else {
      const userID = getUserByEmail(submittedEmail, users);
      req.session.user_id = (userID);
      res.redirect("/urls");
    }
  }
});

// User Registration Page
app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.session.user_id]
  };

  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.render("register", templateVars);
  }
});

// User Registration Request
app.post("/register", (req, res) => {
  const submittedEmail = req.body.email;
  const submittedPW = req.body.password;
  
  if (!submittedEmail || !submittedPW) {
    res.statusCode = 400;
    res.send("Please enter your email and/or password");

  } else if (getUserByEmail(submittedEmail, users)) {
    res.statusCode = 400;
    res.send("Submitted email already in use.");

  } else {
    const userID = generateRandomString();
    const hashedPW = bcrypt.hashSync(submittedPW, 10);

    users[userID] = {
      id: userID,
      email: submittedEmail,
      password: hashedPW
    };
    
    req.session.user_id = (userID);
    res.redirect("/urls");
  }
});

// User Logout
app.post("/logout", (req, res) => {
  req.session = null;

  res.redirect("/urls");
});

// Catch all Functions

app.get("/urls/*", (req, res) => {
  res.redirect("/login");
});

app.get("/*", (req, res) => {
  res.redirect("/login");
});
