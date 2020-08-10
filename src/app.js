require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const logger = require("./logger");
const { v4: uuid } = require("uuid");
// const { bookmarks } = require("./store");
const bodyParser = require("body-parser");
const BookmarksService = require("./bookmarks-service");
path = require("path");
const xss = require("xss");

const { NODE_ENV } = require("./config");

const app = express();

const morganOption = NODE_ENV === "production" ? "tiny" : "common";

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

// app.use(function validateBearerToken(req, res, next) {
//   const apiToken = process.env.API_TOKEN;
//   const authToken = req.get("Authorization");

//   if (!authToken || authToken.split(" ")[1] !== apiToken) {
//     return res.status(401).json({ error: "Unauthorized request" });
//   }
//   // move to the next middleware
//   next();
// });

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
      res.json({
        title: xss(bookmark.title),
        url: xss(bookmark.url),
        descriptions: xss(bookmark.descriptions),
        rating: bookmark.rating,
      });
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
  const newBookmark = {
    title: xss(req.body.title),
    url: xss(req.body.url),
    descriptions: xss(req.body.descriptions),
    rating: xss(req.body.rating),
  };

  for (const [key, value] of Object.entries(newBookmark)) {
    if (value == null) {
      return res.status(400).json({
        error: { message: `Missing '${key}' in request body` },
      });
    }
  }
  //sanitize id 41
  if (newBookmark.rating < 1 || newBookmark.rating > 5) {
    return res.status(400).json({
      error: { message: `Rating must be between 1 and 5` },
    });
  }

  if (!newBookmark.url.includes(".com")) {
    return res.status(400).json({
      error: { message: `URL must include .com` },
    });
  }

  const knexInstance = req.app.get("db");
  BookmarksService.insertBookmark(knexInstance, newBookmark)
    .then((bookmark) => {
      res
        .status(201)
        .location(path.posix.join(req.originalUrl, `/${bookmark.id}`))
        .json(bookmark);
    })
    .catch(next);
});

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
