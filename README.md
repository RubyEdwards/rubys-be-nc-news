# Northcoders News API

Welcome to my first Northcoders project!

I'm building a news API with the skills I've learned so far, try it for yourself [here](https://ruby-edwards-northcoders-news.onrender.com/api)

^ you'll find the list of possible endpoints at this link, have fun!

---

This project is an API that retrieves news data across a number of tables:

- Articles
- Comments
- Topics
- Users

You could sort the articles and/or order them with queries too!

---

You can also do some cool things like:

- Add a comment  
  {
  "username": "your_name",
  "body": "your_comment"
  }

- Update the votes on an article  
  { "inc_votes": 5 }
  { "inc_votes": -10 }

- Delete a comment (by providing the comment_id in the path)

---

Please feel free to clone my project and run it locally.
Follow these steps:

1. Clone the repo with "git clone https://github.com/RubyEdwards/my-nc-news.git"

2. Install all the necessary dependencies with "npm install"
3. Create an environment file (.env.\*) in the root for each of your databases
   - .env.development (set PGDATABASE= _your_database_ here)
   - .env.test (set PGDATABASE= _your_database_test_ here)
4. Seed the databases with "npm run seed"
5. Run tests using "npm run app"

---

Minimum versions required:

- Node - v22.9.0
- Postgres - 14.13 (Homebrew)

---

This portfolio project was created as part of a Digital Skills Bootcamp in Software Engineering provided by [Northcoders](https://northcoders.com/)
