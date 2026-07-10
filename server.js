const express = require("express");
const path = require("path");
const db = require("./db");

const app = express();
const PORT = 3000;
app.use(express.json());
app.use(express.static(path.join(__dirname)));

function validateAsset(data) {
    const { asset_code, category, asset_type, description, quantity, status, custodian } = data;

    if (!asset_code || asset_code.trim() === "") {
        return "Asset Code cannot be empty";
    }
    if (!category || category === "Select Category") {
        return "Please select a valid Category";
    }
    if (!asset_type || asset_type === "Select Asset Type") {
        return "Please select a valid Asset Type";
    }
    if (!description || description.trim() === "") {
        return "Description cannot be empty";
    }
    if (!status || status === "Select Status") {
        return "Please select a valid Status";
    }
    if (!custodian || custodian.trim() === "") {
        return "Custodian cannot be empty";
    }
      const qtyString = String(quantity).trim();
    if (qtyString === "" || !/^\d+$/.test(qtyString)) {
        return "Quantity must be a whole positive number (no decimals or negative numbers)";
    }
    if (parseInt(qtyString) <= 0) {
        return "Quantity must be greater than 0";
    }

    return null;
}

app.get("/assets", (req, res) => {
    const sql = "SELECT * FROM assets ORDER BY id DESC";

    db.query(sql, (err, results) => {
        if (err) {
            console.log("Error fetching assets:", err);
            return res.status(500).json({ error: "Database error while fetching assets" });
        }
        res.json(results);
    });
});
app.get("/assets/search", (req, res) => {
    const q = "%" + (req.query.q || "") + "%";

    const sql = `
        SELECT * FROM assets
        WHERE asset_code LIKE ?
           OR category LIKE ?
           OR subcategory LIKE ?
           OR description LIKE ?
           OR custodian LIKE ?
        ORDER BY id DESC
    `;

    db.query(sql, [q, q, q, q, q], (err, results) => {
        if (err) {
            console.log("Error searching assets:", err);
            return res.status(500).json({ error: "Database error while searching assets" });
        }
        res.json(results);
    });
});
app.post("/assets", (req, res) => {
    const asset_code = (req.body.asset_code || "").trim();
    const category = (req.body.category || "").trim();
    const subcategory = (req.body.subcategory || "").trim();
    const asset_type = (req.body.asset_type || "").trim();
    const description = (req.body.description || "").trim();
    const quantity = req.body.quantity;
    const status = (req.body.status || "").trim();
    const custodian = (req.body.custodian || "").trim();

    const errorMsg = validateAsset({ asset_code, category, asset_type, description, quantity, status, custodian });
    if (errorMsg) {
        return res.status(400).json({ error: errorMsg });
    }
const checkSql = "SELECT id FROM assets WHERE asset_code = ?";
    db.query(checkSql, [asset_code], (err, rows) => {
        if (err) {
            console.log("Error checking duplicate asset code:", err);
            return res.status(500).json({ error: "Database error while checking duplicate asset code" });
        }
        if (rows.length > 0) {
            return res.status(400).json({ error: "Asset Code already exists. Please use a different code." });
        }

        const insertSql = `
            INSERT INTO assets (asset_code, category, subcategory, asset_type, description, quantity, status, custodian)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const values = [asset_code, category, subcategory, asset_type, description, parseInt(quantity), status, custodian];

        db.query(insertSql, values, (err, result) => {
            if (err) {
                console.log("Error inserting asset:", err);
                return res.status(500).json({ error: "Database error while adding asset" });
            }
            res.json({ message: "Asset added successfully", id: result.insertId });
        });
    });
});
