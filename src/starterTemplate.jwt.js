const express = require("express");
const db = require("./db");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.json());
app.use(express.static("public"));
// remove cors below to see an error on localhost:3001
/*
  Access to XMLHttpRequest at 'http://localhost:3000/secure' from 
  origin 'http://localhost:3001' has been blocked by 
  CORS policy: Response to preflight request doesn't pass access control check: 
  No 'Access-Control-Allow-Origin' header is present on the requested resource.
*/
app.use(cors());

app.get("/", (req, res) => {
  res.send(200);
});

const jwtSecret = "somesecret";
const generateToken = user => {
  return jwt.sign(
    {
      sub: user.id,
      iat: new Date().getTime(),
      user: user.username
    },
    jwtSecret,
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
  return jwt.verify(token, jwtSecret);
};

app.get("/secure", (req, res) => {
  const authorization = req.headers.authorization;

  if (!authorization) {
    return res.sendStatus(401);
  }

  const token = authorization.split(" ")[1];
  let payload;
  let foundUser;

  if (token) {
    payload = verifyToken(token);
    foundUser = db.findOne({ id: payload.sub });
  }

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
