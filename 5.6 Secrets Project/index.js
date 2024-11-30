// HINTS:
// 1. Import express and axios
import express from "express";
import axios from "axios";
import { dirname } from "path";
import { fileURLToPath } from "url";

const APP = express();
const PORT = 1510;
APP.use(express.static(`${dirname(fileURLToPath(import.meta.url))}/public/`));

APP.get("/", async (request, response) => {
  const DATA = await axios.get("https://secrets-api.appbrewery.com/random");
  const RESULT = DATA.data;
  response.render("index.ejs", {
    secret: RESULT.secret,
    user: RESULT.username,
  });
});
// 2. Create an express app and set the port number.

// 3. Use the public folder for static files.

// 4. When the user goes to the home page it should render the index.ejs file.

// 5. Use axios to get a random secret and pass it to index.ejs to display the
// secret and the username of the secret.

// 6. Listen on your predefined port and start the server.
APP.listen(PORT, (err) => {
  if (err) throw err;
  console.log(`server is listening at http://localhost:${PORT}`);
});
