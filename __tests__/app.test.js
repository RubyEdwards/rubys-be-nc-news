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
          comment_count: expect.any(Number),
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
        expect(articles).toHaveLength(10);
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
        expect(articles).toHaveLength(10);
        articles.forEach((article) => {
          expect(article).not.toContainKey("body");
        });
      });
  });
  test("200: Responds with an array sorted by created_at in descending order as default", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeSortedBy("created_at", {
          descending: true,
        });
      });
  });
  test("200: Responds with an array of all articles sorted by a valid sort_by", () => {
    return request(app)
      .get("/api/articles?sort_by=article_id")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(10);
        expect(articles).toBeSortedBy("article_id", { descending: true });
      });
  });
  test("200: Responds with array of all articles sorted by created_at in ascending order", () => {
    return request(app)
      .get("/api/articles?order=asc")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(10);
        expect(articles).toBeSortedBy("created_at");
      });
  });
  test("200: Responds with an array of all articles sorted by a valid sort_by in ascending order", () => {
    return request(app)
      .get("/api/articles?sort_by=article_id&&order=asc")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(10);
        expect(articles).toBeSortedBy("article_id");
      });
  });
  test("200: Responds with an array of all articles sorted by a valid sort_by in descending order", () => {
    return request(app)
      .get("/api/articles?sort_by=title&&order=desc")
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toHaveLength(10);
        expect(articles).toBeSortedBy("title", { descending: true });
      });
  });
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
            topic: "cats",
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
  test("400: Responds with relevant error to an invalid sort_by", () => {
    return request(app)
      .get("/api/articles?sort_by=body&&order=asc")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
  test("400: Responds with relevant error to a non-existent sort_by", () => {
    return request(app)
      .get("/api/articles?sort_by=not-a-column&&order=desc")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
  test("400: Responds with relevant error to an invalid order", () => {
    return request(app)
      .get("/api/articles?sort_by=topic&&order=upside_down")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
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
  test("200: Responds with the updated article based on requested article_id and inc_votes in body", () => {
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

describe("GET /api/users/:username", () => {
  test("200: Responds with the relevant user object based on requested username", () => {
    return request(app)
      .get("/api/users/icellusedkars")
      .expect(200)
      .then(({ body: { user } }) => {
        expect(user).toMatchObject({
          username: "icellusedkars",
          name: "sam",
          avatar_url:
            "https://avatars2.githubusercontent.com/u/24604688?s=460&v=4",
        });
      });
  });
  test("404: Responds with relevant error to a non-existent username", () => {
    return request(app)
      .get("/api/users/patricia")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
      });
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  test("200: Responds with the updated article based on requested article_id and inc_votes in body", () => {
    const update = { inc_votes: 5 };
    return request(app)
      .patch("/api/comments/1")
      .send(update)
      .expect(200)
      .then(({ body: { comment } }) => {
        expect(comment).toMatchObject({
          comment_id: 1,
          votes: 21,
          created_at: expect.any(String),
          author: expect.any(String),
          body: expect.any(String),
          article_id: expect.any(Number),
        });
      });
  });
  test("404: Responds with relevant error to a valid but non-existent comment_id", () => {
    const update = { inc_votes: 1 };
    return request(app)
      .patch("/api/comments/100")
      .send(update)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
      });
  });
  test("400: Responds with relevant error to an invalid inc_votes", () => {
    const update = { inc_votes: "a" };
    return request(app)
      .patch("/api/comments/2")
      .send(update)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
  test("400: Responds with relevant error to an invalid comment_id", () => {
    const update = { inc_votes: 1 };
    return request(app)
      .patch("/api/comments/not-an-id")
      .send(update)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
});

describe("POST /api/articles", () => {
  test("201: Responds with the newly created article (without artcle_img_url)", () => {
    const newArticle = {
      author: "rogersop",
      title: "Bananas are the best fruit",
      body: "One medium sized banana can provide up to 33% of our recommended daily amount of Vitamin B6 and they are also an excellent source of Vitamin C – which we all know is great for our immune systems. Bananas also provide magnesium, Vitamin A, iron and copper that are essential to our overall health and wellbeing. They are fat-free, cholesterol-free, and virtually sodium-free. However, they are high in carbohydrates and are not a good food for low-carb diets. And they are definitely not good for cats.",
      topic: "cats",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then(({ body: { article } }) => {
        expect(article).toMatchObject({
          author: "rogersop",
          title: "Bananas are the best fruit",
          article_id: expect.any(Number),
          body: "One medium sized banana can provide up to 33% of our recommended daily amount of Vitamin B6 and they are also an excellent source of Vitamin C – which we all know is great for our immune systems. Bananas also provide magnesium, Vitamin A, iron and copper that are essential to our overall health and wellbeing. They are fat-free, cholesterol-free, and virtually sodium-free. However, they are high in carbohydrates and are not a good food for low-carb diets. And they are definitely not good for cats.",
          topic: "cats",
          created_at: expect.any(String),
          votes: 0,
          article_img_url:
            "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700",
          comment_count: 0,
        });
      });
  });
  test("201: Responds with the newly created article (with artcle_img_url)", () => {
    const newArticle = {
      author: "rogersop",
      title: "Bananas are the best fruit",
      body: "One medium sized banana can provide up to 33% of our recommended daily amount of Vitamin B6 and they are also an excellent source of Vitamin C – which we all know is great for our immune systems. Bananas also provide magnesium, Vitamin A, iron and copper that are essential to our overall health and wellbeing. They are fat-free, cholesterol-free, and virtually sodium-free. However, they are high in carbohydrates and are not a good food for low-carb diets. And they are definitely not good for cats.",
      topic: "cats",
      article_img_url:
        "https://media.post.rvohealth.io/wp-content/uploads/2020/09/bananas-732x549-thumbnail.jpg",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(201)
      .then(({ body: { article } }) => {
        expect(article).toMatchObject({
          author: "rogersop",
          title: "Bananas are the best fruit",
          article_id: expect.any(Number),
          body: "One medium sized banana can provide up to 33% of our recommended daily amount of Vitamin B6 and they are also an excellent source of Vitamin C – which we all know is great for our immune systems. Bananas also provide magnesium, Vitamin A, iron and copper that are essential to our overall health and wellbeing. They are fat-free, cholesterol-free, and virtually sodium-free. However, they are high in carbohydrates and are not a good food for low-carb diets. And they are definitely not good for cats.",
          topic: "cats",
          created_at: expect.any(String),
          votes: 0,
          article_img_url:
            "https://media.post.rvohealth.io/wp-content/uploads/2020/09/bananas-732x549-thumbnail.jpg",
          comment_count: 0,
        });
      });
  });
  test("404: Responds with relevant error when article does not contain minimum required information", () => {
    const newArticle = {
      author: "rogersop",
      title: "Bananas are the best fruit",
      topic: "cats",
    };
    return request(app)
      .post("/api/articles")
      .send(newArticle)
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
      });
  });
  test("400: Responds with relevant error to an invalid username", () => {
    const newComment = {
      author: "Patricia",
      title: "Bananas are the best fruit",
      body: "One medium sized banana can provide up to 33% of our recommended daily amount of Vitamin B6 and they are also an excellent source of Vitamin C – which we all know is great for our immune systems. Bananas also provide magnesium, Vitamin A, iron and copper that are essential to our overall health and wellbeing. They are fat-free, cholesterol-free, and virtually sodium-free. However, they are high in carbohydrates and are not a good food for low-carb diets. And they are definitely not good for cats.",
      topic: "cats",
    };
    return request(app)
      .post("/api/articles")
      .send(newComment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
  test("400: Responds with relevant error to an invalid topic", () => {
    const newComment = {
      author: "rogersop",
      title: "Bananas are the best fruit",
      body: "One medium sized banana can provide up to 33% of our recommended daily amount of Vitamin B6 and they are also an excellent source of Vitamin C – which we all know is great for our immune systems. Bananas also provide magnesium, Vitamin A, iron and copper that are essential to our overall health and wellbeing. They are fat-free, cholesterol-free, and virtually sodium-free. However, they are high in carbohydrates and are not a good food for low-carb diets. And they are definitely not good for cats.",
      topic: "bananas",
    };
    return request(app)
      .post("/api/articles")
      .send(newComment)
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
});

describe("GET /api/articles?limit=:num", () => {
  test("200: Responds with an array of 10 article objects as default", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then(({ body: { articles, total_count } }) => {
        expect(articles).toHaveLength(10);
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
        expect(total_count).toBe(13);
      });
  });
  test("200: Responds with an array of article objects of length equal to the requested limit", () => {
    return request(app)
      .get("/api/articles?limit=3")
      .expect(200)
      .then(({ body: { articles, total_count } }) => {
        expect(articles).toHaveLength(3);
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
        expect(total_count).toBe(13);
      });
  });
  test("200: Responds with an array of article objects of expected length based on requested limit and page", () => {
    return request(app)
      .get("/api/articles?p=2")
      .expect(200)
      .then(({ body: { articles, total_count } }) => {
        expect(articles).toHaveLength(3);
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
        expect(total_count).toBe(13);
      });
  });
  test("404: Responds with relevant error when page does not exist", () => {
    return request(app)
      .get("/api/articles?p=3&&limit=10")
      .expect(404)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("not found");
      });
  });
  test("400: Responds with relevant error to an invalid page", () => {
    return request(app)
      .get("/api/articles?p=apple")
      .expect(400)
      .then(({ body: { msg } }) => {
        expect(msg).toBe("bad request");
      });
  });
});
