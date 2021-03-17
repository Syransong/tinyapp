const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set("view engine", "ejs");

const generateRandomString = function() {
  let randoStr = Math.random().toString(36).substring(2, 8);
  return randoStr;
};

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
}
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase, 
    username: req.cookies["username"] 
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"] 
   };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res, next) => {
  console.log(req.body);
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
  res.redirect("/urls")
});

app.post("/urls/:shortURL/update", (req, res) => {
  const shortURL = urlDatabase[req.body.shortURL];
  const newURL = req.body.newURL;
  
  shortURL = newURL;

  res.redirect(`/urls/${shortURL}`)
});

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");

  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", (req, res) => {
  // generate random userID
  const userID = generateRandomString();
  // add new user to global user object 

  // set a user_id cookie containing the user's new ID 
  res.cookie("user", userID);
  //redirect to the /urls page 
  res.redirect("/urls");
});