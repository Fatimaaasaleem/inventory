

const express = require("express");

const path = require("path");

const db = require("./db"); // our existing MySQL connection


const app = express();

const PORT = 3000;


// This lets our server understand JSON sent from the browser (fetch requests)

app.use(express.json());


// This serves our HTML, CSS, and JS files directly

// so we don't need to set up CORS - everything runs on the same server/port

app.use(express.static(path.join(__dirname)));


// ------------------------------------------

// Helper function: validate asset data

// Returns an error message string if invalid, or null if valid

// ------------------------------------------

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


    // Quantity checks: must be a whole positive number

    // We check it as a string first to catch decimals like "2.5"

    const qtyString = String(quantity).trim();

    if (qtyString === "" || !/^\d+$/.test(qtyString)) {

        return "Quantity must be a whole positive number (no decimals or negative numbers)";

    }

    if (parseInt(qtyString) <= 0) {

        return "Quantity must be greater than 0";

    }


    return null; // no errors

}


// ==========================================

// ROUTE 1: GET all assets

// ==========================================

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


// ==========================================

// ROUTE 2: GET search assets (must come BEFORE /assets/:id if you add one)

// Searches by asset_code, category, subcategory, description, custodian

// ==========================================

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


// ==========================================

// ROUTE 3: POST - add a new asset

// ==========================================

app.post("/assets", (req, res) => {

    // Trim spaces from text fields before doing anything else

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


    // Check for duplicate asset code before inserting

    const checkSql = "SELECT id FROM assets WHERE asset_code = ?";

    db.query(checkSql, [asset_code], (err, rows) => {

        if (err) {

            console.log("Error checking duplicate asset code:", err);

            return res.status(500).json({ error: "Database error while checking duplicate asset code" });

        }

        if (rows.length > 0) {

            return res.status(400).json({ error: "Asset Code already exists. Please use a different code." });

        }


        // No duplicate found, safe to insert

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


// ==========================================

// ROUTE 4: PUT - update an existing asset

// ==========================================

app.put("/assets/:id", (req, res) => {

    const id = req.params.id;


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


    // Check duplicate asset code, but ignore the record we are currently editing

    const checkSql = "SELECT id FROM assets WHERE asset_code = ? AND id != ?";

    db.query(checkSql, [asset_code, id], (err, rows) => {

        if (err) {

            console.log("Error checking duplicate asset code:", err);

            return res.status(500).json({ error: "Database error while checking duplicate asset code" });

        }

        if (rows.length > 0) {

            return res.status(400).json({ error: "Asset Code already exists. Please use a different code." });

        }


        const updateSql = `

            UPDATE assets

            SET asset_code = ?, category = ?, subcategory = ?, asset_type = ?,

                description = ?, quantity = ?, status = ?, custodian = ?

            WHERE id = ?

        `;

        const values = [asset_code, category, subcategory, asset_type, description, parseInt(quantity), status, custodian, id];


        db.query(updateSql, values, (err, result) => {

            if (err) {

                console.log("Error updating asset:", err);

                return res.status(500).json({ error: "Database error while updating asset" });

            }

            if (result.affectedRows === 0) {

                return res.status(404).json({ error: "Asset not found" });

            }

            res.json({ message: "Asset updated successfully" });

        });

    });

});


// ==========================================

// ROUTE 5: DELETE an asset

// ==========================================

app.delete("/assets/:id", (req, res) => {

    const id = req.params.id;

    const sql = "DELETE FROM assets WHERE id = ?";


    db.query(sql, [id], (err, result) => {

        if (err) {

            console.log("Error deleting asset:", err);

            return res.status(500).json({ error: "Database error while deleting asset" });

        }

        if (result.affectedRows === 0) {

            return res.status(404).json({ error: "Asset not found" });

        }

        res.json({ message: "Asset deleted successfully" });

    });

});


// ==========================================

// Start the server

// ==========================================

app.listen(PORT, () => {

    console.log(`Server running at http://localhost:${PORT}`);

});