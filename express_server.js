// Dependencies
const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

// Middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

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
    password: "C00l3stP455w0rd3v3r!"
  },
  "kirby": {
    id: "kirby",
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

const urlsForUser = function(user) {
  let urls = {} ;

  for (let key in urlDatabase) {
    if (urlDatabase[key].userID === user) {
      urls[key] = urlDatabase[key].longURL;
    }
  }
  console.log("printing urls", urls);
  return urls;
}

// Routes

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// URLs Page
app.get("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  const urlsOfUser = urlsForUser(userID);

  const templateVars = {
    urls: urlsOfUser,
    user: users[userID]
  };
  console.log("urls of user", urlsOfUser);
  res.render("urls_index", templateVars);
});

// Create new short URL
app.get("/urls/new", (req, res) => {
  const userID = req.cookies['user_id'];

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
  const loggedUser = req.cookies["user_id"]

  if (urlDatabase[enteredShortURL].userID === loggedUser) {
    console.log("yes thi is the owner");
    let templateVars = {
      shortURL: enteredShortURL,
      longURL: urlDatabase[enteredShortURL].longURL,
      user: users[loggedUser]
    }
    res.render("urls_show", templateVars);
  
  } else { 
    console.log("this is not the owner")
    let templateVars = {
      user: false
     };

    res.render("urls_show", templateVars);
  }
});

// Creating new short URL
app.post("/urls", (req, res) => {
  res.statusCode = 200;
  let shortURL = generateRandomString();
  const userID = req.cookies["user_id"];

  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: userID
  }
  res.redirect(`/urls/${shortURL}`);
});

// Redirects from short to long URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// Deletes short URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.cookies["user_id"];
  const urlsOfUser = urlsForUser(userID);

  if (Object.keys(urlsOfUser).includes(shortURL)) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  }
});

// Updates the shortURL
app.post("/urls/:shortURL/update", (req, res) => {
  const loggedUser = req.cookies["user_id"]; 
  let shortURL = urlDatabase[req.params.shortURL]; //getting an object not value
  const longURL = req.body.longURL;
  console.log("shortURL", shortURL);
  shortURL.longURL = longURL;

  res.redirect(`/urls/${req.params.shortURL}`);
});

// User Login
app.get("/login", (req, res) => {
  const templateVars = { user: null };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  const submittedEmail = req.body.email;
  
  if (!findUser(submittedEmail)) {
    res.statusCode = 403;
    res.send("Sorry, that email does not have an associated account on TinyApp. Please try again.")
  } else if (findUser(submittedEmail)) { 
    const submittedPW = req.body.password;
    
    if (!(submittedPW === findUser(submittedEmail).password)) {
      res.statusCode = 403;
      res.send("Sorry, the password inputted is incorrect. Please try again.")
    } else {
      const userID = findUser(submittedEmail).id;
      res.cookie("user_id", userID);
      res.redirect("/urls");
    }
  }
});

// User Logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");

  res.redirect("/urls");
});

// User Registration 
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

  } else if (findUser(submittedEmail)) {
    res.statusCode = 400;
    res.send("Submitted email already in use.");

  } else {
    const userID = generateRandomString();

    users[userID] = {
      id: userID,
      email: submittedEmail,
      password: submittedPW
    };
    res.cookie("user_id", userID);
    res.redirect("/urls");
  }
});

