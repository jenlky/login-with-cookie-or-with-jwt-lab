const express = require("express");
const db = require("./db");
const cookieSession = require("cookie-session");
const cookieParser = require("cookie-parser");

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

app.use(
  cookieSession({
    name: "session",
    keys: ["my-secret-cookie"],
    maxAge: 60 * 60 * 1000
  })
);

app.get("/", (req, res) => {
  res.send(200);
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const foundUser = db.findOne({ username, password });
  if (foundUser) {
    // return set-cookie header or jwt token({jwt: "jwt token here"}).
    req.session.id = foundUser.id;
    return res.json({
      username: foundUser.username
    });
  } else {
    res.sendStatus(401);
  }
});

app.get("/secure", (req, res) => {
  const id = req.session.id; // replace with your own logic to get id from cookie or jwt

  const foundUser = db.findOne({ id });
  if (foundUser) {
    return res.json({ username: foundUser.username });
  }
  res.sendStatus(401);
});

app.post("/logout", (req, res) => {
  // clear cookie if there is cookie.
  delete req.session.id;
  res.sendStatus(200);
});

const port = 3000;
app.listen(port, () => console.log(`running at port ${port}`));
