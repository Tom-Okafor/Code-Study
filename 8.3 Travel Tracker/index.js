import express, { response } from "express";
import bodyParser from "body-parser";
import pg from "pg";

const { Client } = pg;

const DATABASE = new Client({
  user: "postgres",
  host: "localhost",
  password: "51017991",
  port: 5432,
  database: "world",
});

const app = express();
const port = 3000;
let visited_countries;

await DATABASE.connect();
try {
  let response = await DATABASE.query(
    "SELECT country_code FROM visited_countries"
  );
  visited_countries = response.rows;
} catch (error) {
  if (error) {
    console.error(error);
  }
} finally {
  await DATABASE.end();
}
function extractCountries() {
  let countryArray = [];

  visited_countries.forEach((country) => {
    countryArray.push(country.country_code);
  });
  return countryArray;
}
visited_countries = extractCountries();

console.log(visited_countries);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  //Write your code here.
  res.render("index.ejs", {
    total: visited_countries.length,
    countries: visited_countries,
  });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
