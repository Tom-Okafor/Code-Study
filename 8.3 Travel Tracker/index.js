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

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  //Write your code here.
  try {
    let response = await DATABASE.query(
      "SELECT country_code FROM visited_countries"
    );
    visited_countries = response.rows;
  } catch (error) {
    if (error) {
      console.error(error);
    }
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

  res.render("index.ejs", {
    total: visited_countries.length,
    countries: visited_countries,
  });
});

app.post("/add", addVisitedCountry);

async function getCountryCode(country) {
  let countryCode;
  try {
    const RESPONSE = await DATABASE.query(
      "SELECT country_code FROM countries WHERE country_name LIKE $1",
      [country + "%"]
    );
    countryCode = RESPONSE.rows;
  } catch (error) {
    if (error) {
      console.error(error);
    }
  }
  return countryCode[0].country_code;
}

async function addVisitedCountry(request, response) {
  const COUNTRY = request.body.country;
  const COUNTRY_CODE = await getCountryCode(COUNTRY);
  let visitedCountries;

  try {
    await DATABASE.query(
      "INSERT INTO visited_countries (country_code) VALUES ($1)",
      [COUNTRY_CODE]
    );
    const RESPONSE = await DATABASE.query(
      "SELECT country_code FROM visited_countries"
    );
    visitedCountries = RESPONSE.rows;
    function extractCountries() {
      let countryArray = [];

      visitedCountries.forEach((country) => {
        countryArray.push(country.country_code);
      });
      return countryArray;
    }
    visitedCountries = extractCountries();

    response.render("index.ejs", {
      total: visitedCountries.length,
      countries: visitedCountries,
    });
  } catch (error) {
    if (error) {
      console.error(error);
      let errorMessage =
        "It seems the country you've enetered is not valid. Please, recheck and try again.";
      response.render("index.ejs", {
        total: visitedCountries.length,
        countries: visitedCountries,
        error: errorMessage,
      });
    }
  }
}

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
