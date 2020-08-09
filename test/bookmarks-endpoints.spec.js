const app = require("../src/app");

const knex = require("knex")

describe("Bookmarks endpoints", () => {
    let db

    before("make knex instance", () => {
        db = knex({
            client: "pg",
            connection: process.env.TEST_DB_URL,
        })
        app.set("db", db)
    })

    describe("GET /bookmarks", () => {
        context("Given there is no API token in the header", () => {
            it('responds with 401 and an error message', () => {
                return supertest(app).get('/bookmarks').expect(401, { error: 'Unauthorized request' })
            })
        })
    })
})