require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const logger = require("./logger");
const { v4: uuid } = require("uuid");
const { bookmarks } = require("./store");
const bodyParser = require("body-parser");
const BookmarksService = require("./bookmarks-service");

const { NODE_ENV } = require("./config");

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get("Authorization");

  if (!authToken || authToken.split(" ")[1] !== apiToken) {
    return res.status(401).json({ error: "Unauthorized request" });
  }
  // move to the next middleware
  next();
});

app.get("/bookmarks", (req, res, next) => {
  const knexInstance = req.app.get("db");
  BookmarksService.getAllBookmarks(knexInstance)
    .then((bookmarks) => {
      res.json(bookmarks);
    })
    .catch(next);
});

app.get("/bookmarks/:id", (req, res, next) => {
  const knexInstance = req.app.get("db");
  BookmarksService.getById(knexInstance, req.params.id)
    .then((bookmark) => {
      if (!bookmark) {
        return res.status(404).json({
          error: { message: "Bookmark lol does not exist ok" },
        });
      }
      res.json(bookmark);
    })
    .catch(next);
});

app.delete("/bookmarks/:id", (req, res, next) => {
  const { id } = req.params;
  const knexInstance = req.app.get("db");

  BookmarksService.deleteBookmark(knexInstance, id)
    .then((bookmark) => {
      if (!bookmark) {
        return res.status(404).json({
          error: { message: "Could not deleteekbookmark" },
        });
      }
      res.json(bookmark);
    })
    .catch(next);
});

app.post("/bookmarks", (req, res, next) => {
  const { title, url, descriptions, rating } = req.body;
  if (!title) {
    logger.error("Title required");
    return res.status(400).send("invalid1, lol");
  }

  if (!url || !descriptions || !rating || !title) {
    logger.error("URL required");
    return res.status(400).send("invalid2, lol");
  }

  const newBookmark = {
    title,
    url,
    descriptions,
    rating,
  };

  const knexInstance = req.app.get("db");
  BookmarksService.insertBookmark(knexInstance, newBookmark)
    .then((bookmarks) => {
      res.json(bookmarks);
    })
    .catch(next);
});

// app.delete("/bookmarks/:id", (req, res) => {
//   const { id } = req.params;

//   const bookmarksindex = bookmarks.findIndex((bi) => bi.id == id);

//   if (bookmarksindex === -1) {
//     logger.error(`List with id ${id} not found`);
//     return res.status(404).send("Not found");
//   }

//   bookmarks.splice(bookmarksindex, 1);

//   res.json(bookmarks);
// });

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

// app.get("/bookmarks/:id", (req, res) => {
//   const { id } = req.params;
//   let result = bookmarks.find((li) => li.id == id);

//   if (!result) {
//     logger.error(`ID: ${id} is not found`);
//     return res.status(400).send(`Bookmark with id ${id} not found.`);
//   }
//   res.json(result);
// });

// app.post("/bookmarks", (req, res) => {
//   const { title, content } = req.body;
//   if (!title) {
//     logger.error("Title required");
//     return res.status(400).send("Invalid data, title required");
//   }

//   if (!content) {
//     logger.error("Content required");
//     return res.status(400).send("Invalid data, Content required");
//   }

//   const id = uuid();

//   const bookmark = {
//     id,
//     title,
//     content,
//   };
//   bookmarks.push(bookmark);
//   res.send(bookmarks);
// });

// app.get("/bookmarks/:id", (req, res) => {
//   const { id } = req.params;
//   let result = bookmarks.find((li) => li.id == id);

//   if (!result) {
//     logger.error(`ID: ${id} is not found`);
//     return res.status(400).send(`Bookmark with id ${id} not found.`);
//   }
//   res.json(result);
// });

module.exports = app;
