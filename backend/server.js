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


// Add new product

app.post("/products", (req, res) => {
  const { name, quantity, price } = req.body;
  db.run(
    "INSERT INTO products (name, quantity, price) VALUES (?, ?, ?)",
    [name, parseInt(quantity), parseFloat(price)],
    function(err) {
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
  db.run("DELETE FROM products WHERE id = ?", req.params.id, function(err) {
    if (err) {
      console.error("DB DELETE error:", err);
      res.status(500).json(err);
    } else {
      res.json({ deleted: this.changes });
    }
  });
});


// Update product OR Stock In/Out

app.put("/products/:id", (req, res) => {
  const { quantity, price, stockChange } = req.body;

  if (stockChange !== undefined) {
    // Stock In / Stock Out
    db.run(
      "UPDATE products SET quantity = quantity + ? WHERE id = ?",
      [parseInt(stockChange), req.params.id],
      function(err) {
        if (err) res.status(500).json(err);
        else res.json({ updated: this.changes });
      }
    );
  } else if (quantity !== undefined && price !== undefined) {
    // Update quantity & price
    db.run(
      "UPDATE products SET quantity = ?, price = ? WHERE id = ?",
      [parseInt(quantity), parseFloat(price), req.params.id],
      function(err) {
        if (err) res.status(500).json(err);
        else res.json({ updated: this.changes });
      }
    );
  } else {
    res.status(400).json({ error: "Invalid request body" });
  }
});


const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
