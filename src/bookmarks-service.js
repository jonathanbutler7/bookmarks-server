const BookmarksService = {
  getAllBookmarks(knex) {
    return knex.select("*").from("bookmarks_table");
  },

  insertBookmark(knex, newBookmark) {
    return knex
      .insert(newBookmark)
      .into("bookmarks_table")
      .returning("*")
      .then((rows) => {
        return rows[0];
      });
  },

  getById(knex, id) {
    return knex.from("bookmarks_table").where("id", id).first();
  },

  deleteArticle(knex, id) {
      return knex("bookmarks_table").where({ id }).delete()
  }
};

module.exports = BookmarksService;
