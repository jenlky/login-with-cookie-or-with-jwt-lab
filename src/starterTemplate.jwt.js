const express = require("express");
const db = require("./db");
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.json());
app.use(express.static("public"));

app.get("/", (req, res) => {
  res.send(200);
});

const generateToken = user => {
  return jwt.sign(
    {
      sub: user.id,
      iat: new Date().getTime(),
      user: user.username
    },
    "somesecret",
    { expiresIn: "1h" }
  );
};

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  const foundUser = db.findOne({ username, password });
  if (foundUser) {
    // return set-cookie header or jwt token({jwt: "jwt token here"}).
    const token = generateToken(foundUser);

    return res.json({
      username: foundUser.username,
      jwt: token
    });
  } else {
    res.sendStatus(401);
  }
});

const verifyToken = token => {
  return jwt.verify(token, "somesecret");
};

app.get("/secure", (req, res) => {
  console.log(req.headers.authorization);
  const authorization = req.headers.authorization;
  const token = authorization.split(" ")[1];

  const payload = verifyToken(token);
  const foundUser = db.findOne({ id: payload.sub });

  if (foundUser) {
    return res.json({ username: foundUser.username });
  }
  res.sendStatus(401);
});

app.post("/logout", (req, res) => {
  // clear cookie if there is cookie.
  res.sendStatus(200);
});

const port = 3000;
app.listen(port, () => console.log(`running at port ${port}`));
