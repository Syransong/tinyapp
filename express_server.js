const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

//Global Objects
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "coolGuy88": {
    id: "coolGuy88",
    email: "coolerthancool@cool.com",
    password: "C00l3stP455w0rd3v3r!"
  },
  "kirby": {
    id: "pinkykirby",
    email: "kirbykurbs@dreamland.com",
    password: "M3t4Kn1nght5uck5!"
  }
};

//Global helper functions
const generateRandomString = function() {
  let randoStr = Math.random().toString(36).substring(2, 8);
  return randoStr;
};

const findUser = function(email) {
  for (const userid in users) {
    if (users[userid].email === email) {
      return users[userid];
    }
  }
};

// Routes
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res, next) => {
  res.statusCode = 200;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls/:shortURL/update", (req, res) => {
  let shortURL = urlDatabase[req.body.shortURL];
  const newURL = req.body.newURL;
  
  shortURL = newURL;

  res.redirect(`/urls/${shortURL}`);
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  res.cookie("user_id", req.body.username);
  
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");

  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  };
  res.render("register", templateVars);
});

app.post("/register", (req, res) => {
  const submittedEmail = req.body.email;
  const submittedPW = req.body.password;
  
  if (!submittedEmail || !submittedPW) {
    res.statusCode = 400;
    res.send("Please enter your email and/or password");
    console.log("no username or PW", users);

  } else if (findUser(submittedEmail)) {
    res.statusCode = 400;
    res.send("Submitted email already in use.");
    console.log("email already exists", users);

  } else {
    const userID = generateRandomString();

    users[userID] = {
      id: userID,
      email: submittedEmail,
      password: submittedPW
    };
    res.cookie("user_id", userID);
    console.log(users);
    res.redirect("/urls");
  }
});

