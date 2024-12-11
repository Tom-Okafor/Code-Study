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
    await getVisitedCountries();
  } catch (error) {
    if (error) {
      console.error(error);
    }
  }

  res.render("index.ejs", {
    total: visited_countries.length,
    countries: visited_countries,
  });
});

app.post("/add", addVisitedCountry);

async function addVisitedCountry(request, response) {
  async function getCountryCode(country) {
    let countryCode;
    try {
      const RESPONSE = await DATABASE.query(
        "SELECT country_code FROM countries WHERE country_name LIKE $1",
        [country + "%"]
      );
      countryCode = RESPONSE.rows;
      await getVisitedCountries();
      if (visited_countries.includes(countryCode[0].country_code)) {
        console.log("incluessss");
        response.render("index.ejs", {
          total: visited_countries.length,
          countries: visited_countries,
          error: "This country has already been added",
        });
      } else {
        return countryCode[0].country_code;
      }
    } catch (error) {
      if (error) {
        getVisitedCountries();
        response.render("index.ejs", {
          total: visited_countries.length,
          countries: visited_countries,
          error: "The country you've entered does not exist.",
        });
      }
    }
  }
  let country = request.body.country;
  function formatCountry() {
    let letter = country.slice(0, 1);
    letter = letter.toUpperCase();
    country = country.slice(1, country.length);
    letter += country;
    return letter;
  }
  country = formatCountry();
  const COUNTRY_CODE = await getCountryCode(country);

  try {
    await DATABASE.query(
      "INSERT INTO visited_countries (country_code) VALUES ($1)",
      [COUNTRY_CODE]
    );
    response.redirect("/");
  } catch (error) {
    if (error) {
      console.error(error);
    }
  }
}

async function getVisitedCountries() {
  const GET_COUNTRY_CODES = await DATABASE.query(
    "SELECT country_code FROM visited_countries"
  );
  visited_countries = GET_COUNTRY_CODES.rows;
  visited_countries = extractCountries();
}
function extractCountries() {
  let countryArray = [];

  visited_countries.forEach((country) => {
    countryArray.push(country.country_code);
  });
  return countryArray;
}
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
