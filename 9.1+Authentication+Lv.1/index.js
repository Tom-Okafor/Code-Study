import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Client } = pg;
const app = express();
const port = 3000;
const DB_PASSWORD = process.env.password;

const DATABASE = new Client({
  user: "postgres",
  host: "localhost",
  database: "secrets",
  password: DB_PASSWORD,
  port: 5432,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
await DATABASE.connect();
app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.post("/register", async (req, res) => {
  const EMAIL = req.body.username;
  const PASSWORD = req.body.password;
  try {
    let checkIfUserHasBeenRegistered = await DATABASE.query(
      "SELECT * FROM users WHERE email = $1",
      [EMAIL]
    );
    if (checkIfUserHasBeenRegistered.rows.length) {
      res.send("This email has already registered.");
    } else {
      let newUser = await DATABASE.query(
        "INSERT INTO users (email, password) VALUES($1, $2) RETURNING *",
        [EMAIL, PASSWORD]
      );
      newUser = newUser.rows;
      console.log(newUser);
      res.render("secrets.ejs");
    }
  } catch (error) {
    console.error(error);
  }
});

app.post("/login", async (req, res) => {
  const EMAIL = req.body.username;
  const PASSWORD = req.body.password;
  try {
    let loginPassword = await DATABASE.query(
      "SELECT password FROM users WHERE email = $1",
      [EMAIL]
    );
    loginPassword = loginPassword.rows;
    if (loginPassword[0].password === PASSWORD) {
      res.render("secrets.ejs");
    } else {
      res.send("OOPS! TRY AGAIN");
    }
  } catch (error) {
    res.send("Email not found");
  }
});

app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});
