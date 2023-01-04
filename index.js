const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./db/database.sqlite');
const express = require('express');
const app = express();
const port = 3000;

app.use(express.static('public'));

app.get('/get-data', (req, res) => {
    db.all('SELECT i.name, ip.price, ip.created_at FROM itemprices ip INNER JOIN items i ON i.id = ip.itemsid', [], async (err, items) => {
        res.json(items);
    });
});

app.get('/last-price', (req, res) => {
    db.all('SELECT price FROM itemprices ORDER BY id DESC LIMIT 1', [], async (err, items) => {
        res.json(items[0].price);
    });
})

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});