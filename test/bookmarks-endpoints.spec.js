const app = require("../src/app");

const knex = require("knex");
const { makeBookmarksArray } = require("./bookmarks.fixtures")

describe("Bookmarks endpointsss", () => {
  let db;

  before("make knex instance", () => {
    db = knex({
      client: "pg",
      connection: process.env.TEST_DB_URL,
    });
    app.set("db", db);
  });

  // before("clean the table", () => db("bookmarks-test").truncate())

  // after("cleanup", () => db("bookmarks-test").truncate())

  describe("GET /bookmarks", () => {
    context("Given there is no API token in the header", () => {
      it("responds with 401 and an error message", () => {
        return supertest(app)
          .get("/bookmarks")
          .expect(401, { error: "Unauthorized request" });
      });
    });
  });

  describe.skip("GET /bookmarks", () => {
    context("given there are articles in the database", () => {
      const testBookmarks = makeBookmarksArray();
      beforeEach("insert bookmarks", () => {
        return db.into("bookmarks-test").insert(testBookmarks)
      })
      it('responds with 200 and all the articles', () => {
        return supertest(app).get('/bookmarks').expect(200, testBookmarks)
      })
    })
  })

  describe.only("GET /bookmarks", () => {
    context("given there are no bookmarks", () => {
      it('responds with 200 and an empy list', () => {
        return supertest(app).get('/bookmarks').expect(200, [])
      })
    })
  })
  after("disconnect from db", () => db.destroy())
});
