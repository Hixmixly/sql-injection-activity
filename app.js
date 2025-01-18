const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// Middleware
app.use(express.static('public')); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Initialize SQLite Database
const db = new sqlite3.Database(':memory:');
db.serialize(() => {
  db.run("CREATE TABLE user (username TEXT, password TEXT, title TEXT)", (err) => {
    if (err) console.error("Error creating table:", err.message);
  });
  db.run(
    "INSERT INTO user (username, password, title) VALUES ('privilegedUser', 'privilegedUser1', 'Administrator')",
    (err) => {
      if (err) console.error("Error inserting user:", err.message);
    }
  );
});

// Routes
// Serve the HTML file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle login submissions
app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  const query = `SELECT title FROM user WHERE username = '${username}' AND password = '${password}'`;

  console.log("Username:", username);
  console.log("Password:", password);
  console.log("Query:", query);

  db.get(query, (err, row) => {
    if (err) {
      console.error("Database error:", err.message);
      return res.redirect("/#error");
    }

    if (!row) {
      return res.redirect("/#unauthorized");
    }

    res.send(`
      <h1>Welcome, ${row.title}!</h1>
      <p>This file contains all your secret data:</p>
      <ul>
        <li>SECRETS</li>
        <li>MORE SECRETS</li>
      </ul>
      <a href="/">Go back to login</a>
    `);
  });
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
