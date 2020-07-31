require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const logger = require("./logger");
const { bookmarks } = require("./store");

console.log("token is", process.env.API_TOKEN);
const { NODE_ENV } = require("./config");

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
// const bookmarkRouter = express.Router();

app.use(bodyParser.json());

// app.use(bodyParser())

app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get("Authorization");

  if (!authToken || authToken.split(" ")[1] !== apiToken) {
    return res.status(401).json({ error: "Unauthorized request" });
  }
  // move to the next middleware
  next();
});

app.get("/bookmarks", (req, res) => {
  res.send(bookmarks);
});


app.get("/bookmarks/:id", (req, res) => {
  const { id } = req.params;
  let result = bookmarks.find((li) => li.id == id);

  if (!result) {
    logger.error(`ID: ${id} is not found`);
    return res.status(400).send(`Bookmark with id ${id} not found.`);
  }
  res.json(result);
});

app.post(bodyParser,'/bookmarks', (req,res) => {
  const { title, content } = req.body;
console.log('reqest is', req.body)
res.json(req)
  if (!title) {
    logger.error("Title required")
    return res.status(400).send("Invalid data, title required");
  }

  if(!content) {
    logger.error("Content required")
    return res.status(400).send("Invalid data, Content required");
  }

  const id = uuid();

  const bookmark = {
    id, title, content
  }
  bookmarks.push(bookmark)
})

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
