import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";

const app = express();
const port = 3000;
const saltRounds = 10;
dotenv.config();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(
  session({
    secret: "MYSPECIALSECRET",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 3,
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
const db = new pg.Pool({
  user: "postgres",
  host: "localhost",
  database: "secrets",
  password: process.env.password,
  port: 5432,
});

app.get("/", (req, res) => {
  res.render("home.ejs");
});

app.get("/login", (req, res) => {
  res.render("login.ejs");
});

app.get("/register", (req, res) => {
  res.render("register.ejs");
});

app.get("/secrets", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("secrets.ejs");
  } else {
    res.redirect("/login");
  }
});
app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;

  try {
    const checkResult = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (checkResult.rows.length > 0) {
      res.send("Email already exists. Try logging in.");
    } else {
      //hashing the password and saving it in the database
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.error("Error hashing password:", err);
        } else {
          console.log("Hashed Password:", hash);
          const result = await db.query(
            "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
            [email, hash]
          );
          const user = result.rows[0];
          req.login(user, (err) => {
            if (err) {
              console.log(err);
            } else {
              res.redirect("/secrets");
            }
          });
        }
      });
    }
  } catch (err) {
    console.log(err);
  }
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/secrets",
    failureRedirect: "/login",
  })
);

passport.use(
  new Strategy(async function verify(username, password, done) {
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1", [
        username,
      ]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedHashedPassword = user.password;
        bcrypt.compare(password, storedHashedPassword, (err, result) => {
          if (err) {
            return done(err);
          } else {
            if (result) {
              return done(null, true);
            } else {
              return done(null, true);
            }
          }
        });
      } else {
        return done("User not found");
      }
    } catch (err) {
      return done(err);
    }
  })
);
passport.serializeUser((user, done) => {
  done(null, user);
});
passport.deserializeUser((user, done) => {
  done(null, user);
});

app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});
