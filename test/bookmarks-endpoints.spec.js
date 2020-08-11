const app = require("../src/app");

const knex = require("knex");
const { makeBookmarksArray } = require("./bookmarks.fixtures");

describe("Bookmarks endpointsss", () => {
  let db;

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL,
    });
    app.set("db", db);
  });

  before("insert bookmarks", async () => {
    const testBookmarks = makeBookmarksArray();
    await db.into("bookmarks_table").insert(testBookmarks);
  });

  // before("clean the table", () => db("bookmarks_table").truncate())

  before("validate bearer API token", () => {});

  after("cleanup", () => db("bookmarks_table").truncate());

  after("disconnect from db", () => db.destroy());

  describe("GET /bookmarks", () => {
    context("Given there is no API token in the header", () => {
      it("responds with 401 and an error message", () => {
        return supertest(app)
          .get("/bookmarks")
          .expect(401, { error: "Unauthorized request" });
      });
    });
  });

  describe("GET /bookmarks", () => {
    context("given there are bookmarks in the database", () => {
      const testBookmarks = makeBookmarksArray();
      it("responds with 200 and all the bookmarks", () => {
        return supertest(app)
          .get("/bookmarks")
          .set("Authorization", "Bearer be59efa6-94c1-494f-bccf-35e04fe2fbfb")
          .expect(200, testBookmarks);
      });
    });
  });

  describe("GET /bookmarks/:id", () => {
    context("Given there are no articles", () => {
      it("responds with 404", () => {
        const bookmarkId = 123456;
        return supertest(app)
          .get(`/bookmarks/${bookmarkId}`)
          .set("Authorization", "Bearer be59efa6-94c1-494f-bccf-35e04fe2fbfb")
          .expect(404, {
            error: { message: "Bookmark lol does not exist ok" },
          });
      });
    });
  });

  describe("POST /bookmarks", () => {
    it("creates an article, responds with 201 and new bookmark", () => {
      const newBookmark = {
        title: "fun for you",
        url: "fun.com",
        descriptions: "a website on fun",
        rating: 4,
      };

      return supertest(app)
        .post("/bookmarks")
        .set("Authorization", "Bearer be59efa6-94c1-494f-bccf-35e04fe2fbfb")
        .send(newBookmark)

        .expect(500)
        .expect((res) => {
          expect(res.body.title).to.eql(newBookmark.title);
        });
    });
  });

  describe("GET /bookmarks", () => {
    context("given there are no bookmarks", () => {
      it("responds with 200 and an empty list", () => {
        db.truncate()
          .then(() => {
            return supertest(app)
              .get("/bookmarks")
              .set(
                "Authorization",
                "Bearer be59efa6-94c1-494f-bccf-35e04fe2fbfb"
              )
              .expect(200, []);
          })
          .catch((error) => {
            console.log(error);
          });
      });
    });
  });
});
