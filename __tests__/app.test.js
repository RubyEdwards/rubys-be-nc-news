const endpointsJson = require("../endpoints.json");
const request = require("supertest");
const app = require("../app");
const db = require("../db/connection");
const data = require("../db/data/test-data");
const seed = require("../db/seeds/seed");

beforeEach(() => {
  return seed(data);
});

afterAll(() => {
  return db.end();
});

describe("Route not found", () => {
  test("404: Request made to non-existent route", () => {
    return request(app)
      .get("/appi")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
      });
  });
});

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});

describe("GET /api/topics", () => {
  test("200: Responds with an array of topic objects", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { topics } }) => {
        expect(topics).toHaveLength(3);
        topics.forEach((topic) => {
          expect(topic).toMatchObject({
            slug: expect.any(String),
            description: expect.any(String),
          });
        });
      });
  });
});

describe("GET /api/articles/:article_id", () => {
  test("200: Responds with the relevant article object based on requested article_id", () => {
    return request(app)
      .get("/api/articles/7")
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toMatchObject({
          author: expect.any(String),
          title: expect.any(String),
          article_id: 7,
          body: expect.any(String),
          topic: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
        });
      });
  });
  test("404: Responds with relevant error to a valid but non-existent article_id", () => {
    return request(app)
      .get("/api/articles/100")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
      });
  });
  test("400: Responds with relevant error to an invalid article_id", () => {
    return request(app)
      .get("/api/articles/not-an-id")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
});

describe("GET /api/articles", () => {
  test("200: Responds with an array of article objects", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(13);
        articles.forEach((article) => {
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
      });
  });
  test("200: Response objects do not contain a body property", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(13);
        articles.forEach((article) => {
          expect(article).not.toContainKey("body");
        });
      });
  });
  test("200: Response array is sorted by created_at (date) in descending order", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("200: Responds with an array of comments based on requested article_id", () => {
    return request(app)
      .get("/api/articles/5/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toHaveLength(2);
        comments.forEach((comment) => {
          expect(comment).toMatchObject({
            comment_id: expect.any(Number),
            votes: expect.any(Number),
            created_at: expect.any(String),
            author: expect.any(String),
            body: expect.any(String),
            article_id: 5,
          });
        });
      });
  });
  test("200: Response array is served with most recent comments first (sorted by created_at (date) in descending order)", () => {
    return request(app)
      .get("/api/articles/5/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
  test("200: Responds with an empty array to a valid article_id with no comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments).toEqual([]);
      });
  });
  test("404: Responds with relevant error to a valid but non-existent article_id", () => {
    return request(app)
      .get("/api/articles/100/comments")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
      });
  });
  test("400: Responds with relevant error to an invalid article_id", () => {
    return request(app)
      .get("/api/articles/not-an-id/comments")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("201: Responds with the newly created comment", () => {
    const newComment = {
      username: "butter_bridge",
      body: "Don't you just LOVE commenting?",
    };
    return request(app)
      .post("/api/articles/3/comments")
      .send(newComment)
      .expect(201)
      .then(({ body: { comment } }) => {
        expect(comment).toMatchObject({
          comment_id: expect.any(Number),
          votes: expect.any(Number),
          created_at: expect.any(String),
          author: "butter_bridge",
          body: "Don't you just LOVE commenting?",
          article_id: 3,
        });
      });
  });
  test("404: Responds with relevant error to a valid but non-existent article_id", () => {
    const newComment = {
      username: "butter_bridge",
      body: "Don't you just LOVE commenting?",
    };
    return request(app)
      .post("/api/articles/100/comments")
      .send(newComment)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
      });
  });
  test("404: Responds with relevant error when comment does not contain required information", () => {
    const newComment = {
      body: "Don't you just LOVE commenting?",
    };
    return request(app)
      .post("/api/articles/2/comments")
      .send(newComment)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
      });
  });
  test("400: Responds with relevant error to an invalid username", () => {
    const newComment = {
      username: "Patricia",
      body: "Don't you just LOVE commenting?",
    };
    return request(app)
      .post("/api/articles/1/comments")
      .send(newComment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
  test("400: Responds with relevant error to an invalid article_id", () => {
    const newComment = {
      username: "butter_bridge",
      body: "Don't you just LOVE commenting?",
    };
    return request(app)
      .post("/api/articles/not-an-id/comments")
      .send(newComment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
});

describe("PATCH /api/articles/:article_id", () => {
  test("200: Responds with the updated article based on requested article_id and inc_votes", () => {
    const update = { inc_votes: 5 };
    return request(app)
      .patch("/api/articles/1")
      .send(update)
      .expect(200)
      .then(({ body: { article } }) => {
        expect(article).toMatchObject({
          author: expect.any(String),
          title: expect.any(String),
          article_id: 1,
          body: expect.any(String),
          topic: expect.any(String),
          created_at: expect.any(String),
          votes: 105,
          article_img_url: expect.any(String),
        });
      });
  });
  test("404: Responds with relevant error to a valid but non-existent article_id", () => {
    const update = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/100")
      .send(update)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
      });
  });
  test("400: Responds with relevant error to an invalid inc_votes", () => {
    const update = { inc_votes: "a" };
    return request(app)
      .patch("/api/articles/2")
      .send(update)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
  test("400: Responds with relevant error to an invalid article_id", () => {
    const update = { inc_votes: 1 };
    return request(app)
      .patch("/api/articles/not-an-id")
      .send(update)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("204: Responds with code and no body", () => {
    return request(app).delete("/api/comments/4").expect(204);
  });
  test("404: Responds with relevant error to a valid but non-existent comment_id", () => {
    return request(app)
      .delete("/api/comments/100")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
      });
  });
  test("400: Responds with relevant error to an invalid comment_id", () => {
    return request(app)
      .delete("/api/comments/not-an-id")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
});

describe("GET /api/users", () => {
  test("200: Responds with an array of user objects", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then(({ body: { users } }) => {
        expect(users).toHaveLength(4);
        users.forEach((user) => {
          expect(user).toMatchObject({
            username: expect.any(String),
            name: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});

describe("GET /api/articles?sort_by=:column", () => {
  test("200: Responds with an array of all articles sorted by article_id", () => {
    return request(app)
      .get("/api/articles?sort_by=article_id")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(13);
        expect(articles).toBeSortedBy("article_id", { descending: true });
      });
  });
  test("200: Responds with an array of all articles sorted by title", () => {
    return request(app)
      .get("/api/articles?sort_by=title")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(13);
        expect(articles).toBeSortedBy("title", { descending: true });
      });
  });
  test("200: Responds with an array of all articles sorted by topic", () => {
    return request(app)
      .get("/api/articles?sort_by=topic")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(13);
        expect(articles).toBeSortedBy("topic", { descending: true });
      });
  });
  test("200: Responds with an array of all articles sorted by author", () => {
    return request(app)
      .get("/api/articles?sort_by=author")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(13);
        expect(articles).toBeSortedBy("author", { descending: true });
      });
  });
  test("200: Responds with an array of all articles sorted by votes", () => {
    return request(app)
      .get("/api/articles?sort_by=votes")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(13);
        expect(articles).toBeSortedBy("votes", { descending: true });
      });
  });
  test("400: Responds with relevant error to an invalid sort_by", () => {
    return request(app)
      .get("/api/articles?sort_by=body")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
  test("400: Responds with relevant error to a non-existent sort_by", () => {
    return request(app)
      .get("/api/articles?sort_by=not-a-column")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
});

describe("GET /api/articles?order=asc", () => {
  test("200: Responds with array of all articles sorted by created_at in ascending order", () => {
    return request(app)
      .get("/api/articles?order=asc")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(13);
        expect(articles).toBeSortedBy("created_at");
      });
  });
  test("400: Responds with relevant error to an invalid order", () => {
    return request(app)
      .get("/api/articles?order=upside_down")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
});

describe("GET /api/articles?sort_by=:column&&order=:order", () => {
  test("200: Responds with an array of all articles sorted by article_id in ascending order", () => {
    return request(app)
      .get("/api/articles?sort_by=article_id&&order=asc")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(13);
        expect(articles).toBeSortedBy("article_id");
      });
  });
  test("200: Responds with an array of all articles sorted by title in descending order", () => {
    return request(app)
      .get("/api/articles?sort_by=title&&order=desc")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(13);
        expect(articles).toBeSortedBy("title", { descending: true });
      });
  });
  test("200: Responds with an array of all articles sorted by topic in ascending order", () => {
    return request(app)
      .get("/api/articles?sort_by=topic&&order=asc")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(13);
        expect(articles).toBeSortedBy("topic");
      });
  });
  test("200: Responds with an array of all articles sorted by author in descending order", () => {
    return request(app)
      .get("/api/articles?sort_by=author&&order=desc")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(13);
        expect(articles).toBeSortedBy("author", { descending: true });
      });
  });
  test("200: Responds with an array of all articles sorted by votes in ascending order", () => {
    return request(app)
      .get("/api/articles?sort_by=votes&&order=asc")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(13);
        expect(articles).toBeSortedBy("votes");
      });
  });
});

describe("GET /api/articles?topic=:topic", () => {
  test("200: Responds with an array of articles based on requested topic", () => {
    return request(app)
      .get("/api/articles?topic=cats")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(1);
        articles.forEach((article) => {
          expect(article).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            article_id: expect.any(Number),
            topic: expect.any(String),
            created_at: expect.any(String),
            votes: expect.any(Number),
            article_img_url: expect.any(String),
            comment_count: expect.any(Number),
          });
        });
      });
  });
  test("200: Responds with an empty array to a valid topic with no articles", () => {
    return request(app)
      .get("/api/articles?topic=paper")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toEqual([]);
      });
  });
  test("404: Responds with relevant error to a non-existent topic", () => {
    return request(app)
      .get("/api/articles?topic=potatoes")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
      });
  });
});
