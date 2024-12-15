import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "world",
  password: "51017991",
  port: 5432,
});
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let currentUserId = 1;
const COLORS = [
  "#db2828",
  "#f2711c",
  "#b5cc18",
  "#21ba45",
  "#6435c9",
  "#e03997",
];

/*let users = [
  { id: 1, name: "Angela", color: "teal" },
  { id: 2, name: "Jack", color: "powderblue" },
];*/
async function getUsers() {
  let users = await db.query("SELECT * FROM users");
  users = users.rows;
  return users;
}
console.log(await getUsers());

async function checkVisisted() {
  const result = await db.query(
    "SELECT country_code FROM visited_countries WHERE user_id = $1",
    [currentUserId]
  );
  let countries = [];
  result.rows.forEach((country) => {
    countries.push(country.country_code);
  });
  return countries;
}
app.get("/", async (req, res) => {
  const countries = await checkVisisted();
  const USERS = await getUsers();
  const INDEX = USERS.findIndex((user) => user.id === currentUserId);
  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: USERS,
    color: USERS[INDEX].color,
    INDEX,
  });
});
app.post("/add", async (req, res) => {
  const input = req.body["country"];
  if (input === "") {
    sendErrorMessage(req, res, "Please, enter a country.");
  } else {
    try {
      const result = await db.query(
        "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE  $1 || '%';",
        [input.toLowerCase()]
      );
      const data = result.rows[0];
      const countryCode = data.country_code;
      try {
        await db.query(
          "INSERT INTO visited_countries (country_code, user_id) VALUES ($1, $2)",
          [countryCode, currentUserId]
        );
        res.redirect("/");
      } catch (err) {
        await sendErrorMessage(
          req,
          res,
          "You have already entered this country."
        );
        console.log(err);
      }
    } catch (err) {
      await sendErrorMessage(
        req,
        res,
        "The country you entered does not exist."
      );
      console.log(err);
    }
  }
});
app.post("/user", async (req, res) => {
  if (req.body.user) {
    currentUserId = +req.body.user;
    res.redirect("/");
  } else {
    res.render("new.ejs");
  }
});

app.post("/new", async (req, res) => {
  //Hint: The RETURNING keyword can return the data that was inserted.
  //https://www.postgresql.org/docs/current/dml-returning.html
  const NAME = req.body.name;
  let color = req.body.color;
  if (!color) {
    color = COLORS[Math.floor(Math.random() * COLORS.length)];
  }
  await db.query("INSERT INTO users (name, color) VALUES ($1, $2)", [
    NAME,
    color,
  ]);
  res.redirect("/");
});

async function sendErrorMessage(req, res, errorMessage) {
  const countries = await checkVisisted();
  const USERS = await getUsers();
  const INDEX = USERS.findIndex((user) => user.id === currentUserId);
  res.render("index.ejs", {
    countries: countries,
    total: countries.length,
    users: USERS,
    color: USERS[INDEX].color,
    INDEX,
    error: errorMessage,
  });
}

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
