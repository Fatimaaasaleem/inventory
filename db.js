const mysql = require("mysql2");

const pool = mysql.createPool({
    host: process.env.MYSQLHOST,
    port: process.env.MYSQLPORT,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
});

// Quick check on startup so we get a clear log message,
// without holding a single long-lived connection open.
pool.getConnection((err, conn) => {
    if (err) {
        console.log("Connection failed:", err);
        return;
    }
    console.log("Connected to MySQL!");
    conn.release();
});

module.exports = pool;


On Fri, Jul 10, 2026 at 1:46 PM Samman Sajjad <sammansajjad156@gmail.com> wrote:
@@ -1,19 +1,27 @@
const mysql = require("mysql2");

const connection = mysql.createConnection({
const pool = mysql.createPool({
    host: process.env.MYSQLHOST,
    port: process.env.MYSQLPORT,
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
});

connection.connect((err) => {
// Quick check on startup so we get a clear log message,
// without holding a single long-lived connection open.
pool.getConnection((err, conn) => {
    if (err) {
        console.log("Connection failed:", err);
        return;
    }
    console.log("Connected to MySQL!");
    conn.release();
});

module.exports = connection;
module.exports = pool;
