// backend/server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const db = require("./database");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Get all products
app.get("/products", (req, res) => {
  db.all("SELECT * FROM products", [], (err, rows) => {
    if (err) {
      console.error("DB GET error:", err);
      res.status(500).json(err);
    } else {
      res.json(rows);
    }
  });
});

// Add product
app.post("/products", (req, res) => {
  const { name, quantity, price } = req.body;

  console.log("Received:", req.body); // Debug log

  db.run(
    "INSERT INTO products (name, quantity, price) VALUES (?, ?, ?)",
    [name, parseInt(quantity), parseFloat(price)],
    function (err) {
      if (err) {
        console.error("DB INSERT error:", err);
        res.status(500).json(err);
      } else {
        res.json({ id: this.lastID, name, quantity, price });
      }
    }
  );
});

// Delete product
app.delete("/products/:id", (req, res) => {
  db.run("DELETE FROM products WHERE id = ?", req.params.id, function (err) {
    if (err) {
      console.error("DB DELETE error:", err);
      res.status(500).json(err);
    } else {
      res.json({ deleted: this.changes });
    }
  });
});

// Update product
app.put("/products/:id", (req, res) => {
  const { quantity, price } = req.body;
  db.run(
    "UPDATE products SET quantity = ?, price = ? WHERE id = ?",
    [parseInt(quantity), parseFloat(price), req.params.id],
    function (err) {
      if (err) {
        console.error("DB UPDATE error:", err);
        res.status(500).json(err);
      } else {
        res.json({ updated: this.changes });
      }
    }
  );
});


const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
