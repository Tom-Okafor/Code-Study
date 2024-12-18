import express from "express";
import bodyParser from "body-parser";
import pg from "pg";


const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const { Client } = pg;
const DATABASE = new Client({
  user: "postgres",
  password: "51017991",
  database: "permalist",
  port: 5432,
  host: "localhost",
});

let items = [
  { id: 1, title: "Buy milk" },
  { id: 2, title: "Finish homework" },
];
await DATABASE.connect();
app.get("/", async (req, res) => {
  const RESPONSE = await DATABASE.query("SELECT * FROM items");
  items = RESPONSE.rows;
  console.log(items);
  res.render("index.ejs", {
    listTitle: "Today",
    listItems: items,
  });
});

app.post("/add", async (req, res) => {
  const ITEM = req.body.newItem;
  await DATABASE.query("INSERT INTO items (title) VALUES ($1)", [ITEM]);
  res.redirect("/");
});

app.post("/edit", async (req, res) => {
  const ITEM_ID = req.body.updatedItemId;
  const NEW_TITLE = req.body.updatedItemTitle;
  await DATABASE.query("UPDATE items SET title = $1 WHERE id = $2", [
    NEW_TITLE,
    ITEM_ID,
  ]);
  res.redirect("/");
});

app.post("/delete", async (req, res) => {
  const ITEM_ID = req.body.deleteItemId;
  await DATABASE.query("DELETE FROM items WHERE id = $1", [ITEM_ID]);
  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
