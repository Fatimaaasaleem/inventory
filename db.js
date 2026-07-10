const mysql = require("mysql2");

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "fatima123",
    database: "inventory"
});

connection.connect((err) => {
    if (err) {
        console.log("Connection failed:", err);
        return;
    }
    console.log("Connected to MySQL!");
});

module.exports = connection;