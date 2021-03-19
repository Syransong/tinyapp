const generateRandomString = function() {
  let randoStr = Math.random().toString(36).substring(2, 8);
  return randoStr;
};

const getUserByEmail = function(email, database) {
  for (const userid in database) {
    if (database[userid].email === email) {
      return database[userid];
    }
  }
}

const urlsForUser = function(id, obj) {
  let urls = {};

  for (let key in obj) {
    if (obj[key].userID === id) {
      urls[key] = obj[key].longURL;
    }
  }
  return urls;
};

module.exports = { generateRandomString, getUserByEmail, urlsForUser};
